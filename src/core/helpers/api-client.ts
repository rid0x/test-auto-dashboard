import { APIRequestContext, request } from '@playwright/test';
import { ProjectConfig } from '../types/project.types';

/**
 * Magento REST/GraphQL API client for API-level tests.
 * Supports both guest and authenticated requests.
 */
export class MagentoApiClient {
  private context: APIRequestContext | null = null;
  private adminToken: string | null = null;
  private customerToken: string | null = null;

  constructor(private config: ProjectConfig) {}

  get restBase(): string {
    return `${this.config.api?.baseUrl || this.config.baseUrl}${this.config.api?.restEndpoint || '/rest/V1'}`;
  }

  get graphqlUrl(): string {
    return `${this.config.api?.baseUrl || this.config.baseUrl}${this.config.api?.graphqlEndpoint || '/graphql'}`;
  }

  async init(): Promise<void> {
    this.context = await request.newContext({
      baseURL: this.config.api?.baseUrl || this.config.baseUrl,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
    }
  }

  private getContext(): APIRequestContext {
    if (!this.context) {
      throw new Error('API client not initialized. Call init() first.');
    }
    return this.context;
  }

  // --- Authentication ---

  async getCustomerToken(email: string, password: string): Promise<string> {
    const ctx = this.getContext();
    const response = await ctx.post(`${this.config.api?.restEndpoint || '/rest/V1'}/integration/customer/token`, {
      data: { username: email, password },
    });

    if (!response.ok()) {
      throw new Error(`Failed to get customer token: ${response.status()} ${await response.text()}`);
    }

    this.customerToken = (await response.json()) as string;
    return this.customerToken;
  }

  private authHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const token = this.customerToken || this.adminToken;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // --- REST API Methods ---

  async get(endpoint: string): Promise<any> {
    const ctx = this.getContext();
    const response = await ctx.get(`${this.config.api?.restEndpoint || '/rest/V1'}${endpoint}`, {
      headers: this.authHeaders(),
    });
    return { status: response.status(), body: await response.json().catch(() => null) };
  }

  async post(endpoint: string, data: any): Promise<any> {
    const ctx = this.getContext();
    const response = await ctx.post(`${this.config.api?.restEndpoint || '/rest/V1'}${endpoint}`, {
      data,
      headers: this.authHeaders(),
    });
    return { status: response.status(), body: await response.json().catch(() => null) };
  }

  // --- GraphQL ---

  async graphql(query: string, variables?: Record<string, any>): Promise<any> {
    const ctx = this.getContext();
    const response = await ctx.post(this.config.api?.graphqlEndpoint || '/graphql', {
      data: { query, variables },
      headers: this.authHeaders(),
    });
    return { status: response.status(), body: await response.json().catch(() => null) };
  }

  // --- Common Magento API Operations ---

  async searchProducts(searchTerm: string): Promise<any> {
    return this.get(
      `/products?searchCriteria[filterGroups][0][filters][0][field]=name` +
      `&searchCriteria[filterGroups][0][filters][0][value]=%25${encodeURIComponent(searchTerm)}%25` +
      `&searchCriteria[filterGroups][0][filters][0][conditionType]=like` +
      `&searchCriteria[pageSize]=10`
    );
  }

  async getProductBySku(sku: string): Promise<any> {
    return this.get(`/products/${encodeURIComponent(sku)}`);
  }

  async createGuestCart(): Promise<any> {
    return this.post('/guest-carts', {});
  }

  async addToGuestCart(cartId: string, sku: string, qty: number): Promise<any> {
    return this.post(`/guest-carts/${cartId}/items`, {
      cartItem: { sku, qty, quote_id: cartId },
    });
  }

  async getGuestCart(cartId: string): Promise<any> {
    return this.get(`/guest-carts/${cartId}`);
  }

  async getStoreConfig(): Promise<any> {
    return this.get('/store/storeConfigs');
  }

  async getCmsPage(pageId: number): Promise<any> {
    return this.get(`/cmsPage/${pageId}`);
  }

  // GraphQL: search products
  async graphqlSearchProducts(searchTerm: string): Promise<any> {
    const query = `
      query ProductSearch($search: String!) {
        products(search: $search, pageSize: 10) {
          total_count
          items {
            name
            sku
            price_range {
              minimum_price {
                regular_price {
                  value
                  currency
                }
              }
            }
            url_key
            image {
              url
            }
          }
        }
      }
    `;
    return this.graphql(query, { search: searchTerm });
  }

  // GraphQL: get cart
  async graphqlCreateEmptyCart(): Promise<any> {
    return this.graphql(`mutation { createEmptyCart }`);
  }
}
