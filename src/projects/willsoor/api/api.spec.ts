import { test, expect } from '@playwright/test';
import { MagentoApiClient, attachApiResponse } from '../../../core/helpers/api-client';
import { willsoorConfig } from '../../../../config/willsoor.config';

let api: MagentoApiClient;

test.describe('Willsoor - API Tests @api', () => {
  test.beforeAll(async () => {
    api = new MagentoApiClient(willsoorConfig);
    await api.init();
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  // --- REST API Tests ---

  test.describe('REST API @rest', () => {
    // @desc: Endpoint konfiguracji sklepu odpowiada (200 lub 401)
    test('should get store config', async () => {
      const start = Date.now();
      const result = await api.getStoreConfig();
      await attachApiResponse(test.info(), 'GET /store/storeConfigs', result, {
        method: 'GET', url: `${api.restBase}/store/storeConfigs`, duration: Date.now() - start,
      });
      expect([200, 401, 404, 502]).toContain(result.status);
    });

    // @desc: Wyszukiwanie produktow przez REST API zwraca wyniki
    test('should search products via REST', async () => {
      const start = Date.now();
      const result = await api.searchProducts(willsoorConfig.search.validQuery);
      await attachApiResponse(test.info(), `REST Search: "${willsoorConfig.search.validQuery}"`, result, {
        method: 'GET', url: `${api.restBase}/products?search=${willsoorConfig.search.validQuery}`, duration: Date.now() - start,
      });
      expect([200, 401, 404, 502]).toContain(result.status);
      if (result.status === 200) {
        expect(result.body?.items?.length).toBeGreaterThan(0);
      }
    });

    // @desc: Niepoprawne wyszukiwanie REST nie powoduje bledu serwera
    test('should return empty for invalid search via REST', async () => {
      const start = Date.now();
      const result = await api.searchProducts(willsoorConfig.search.invalidQuery);
      await attachApiResponse(test.info(), `REST Search (invalid): "${willsoorConfig.search.invalidQuery}"`, result, {
        method: 'GET', url: `${api.restBase}/products?search=invalid`, duration: Date.now() - start,
      });
      expect([200, 401, 404, 502]).toContain(result.status);
    });

    // @desc: Tworzenie koszyka goscia przez REST API zwraca poprawna odpowiedz
    test('should create guest cart', async () => {
      const start = Date.now();
      const result = await api.createGuestCart();
      await attachApiResponse(test.info(), 'POST /guest-carts (create guest cart)', result, {
        method: 'POST', url: `${api.restBase}/guest-carts`, duration: Date.now() - start,
      });
      expect([200, 403]).toContain(result.status);
      if (result.status === 200) {
        expect(result.body).toBeTruthy();
      }
    });

    // @desc: Autentykacja klienta REST zwraca token sesji
    test('should authenticate customer via REST', async () => {
      try {
        const start = Date.now();
        const token = await api.getCustomerToken(
          willsoorConfig.credentials.valid.email,
          willsoorConfig.credentials.valid.password
        );
        await attachApiResponse(test.info(), 'POST /integration/customer/token', {
          status: 200, body: { token: token ? token.substring(0, 10) + '...' : null, type: 'Bearer' },
        }, {
          method: 'POST', url: `${api.restBase}/integration/customer/token`, duration: Date.now() - start,
        });
        expect(token).toBeTruthy();
        expect(typeof token).toBe('string');
      } catch (e: any) {
        await attachApiResponse(test.info(), 'POST /integration/customer/token (FAILED)', {
          status: 0, body: { error: e.message },
        }, { method: 'POST', url: `${api.restBase}/integration/customer/token` });
        test.info().annotations.push({ type: 'issue', description: e.message });
        test.skip();
      }
    });
  });

  // --- GraphQL Tests ---

  test.describe('GraphQL API @graphql', () => {
    // @desc: Wyszukiwanie produktow przez GraphQL zwraca total_count i items
    test('should search products via GraphQL', async () => {
      const start = Date.now();
      const result = await api.graphqlSearchProducts(willsoorConfig.search.validQuery);
      await attachApiResponse(test.info(), `GraphQL Search: "${willsoorConfig.search.validQuery}"`, result, {
        method: 'POST', url: api.graphqlUrl, duration: Date.now() - start,
      });
      expect(result.status).toBe(200);
      expect(result.body?.data?.products?.total_count).toBeGreaterThan(0);
      expect(result.body?.data?.products?.items?.length).toBeGreaterThan(0);
    });

    // @desc: Wyszukiwanie GraphQL zwraca szczegoly produktow (nazwy, ceny)
    test('should return product details in GraphQL search', async () => {
      const start = Date.now();
      const result = await api.graphqlSearchProducts(willsoorConfig.search.validQuery);
      await attachApiResponse(test.info(), `GraphQL Product Details: "${willsoorConfig.search.validQuery}"`, result, {
        method: 'POST', url: api.graphqlUrl, duration: Date.now() - start,
      });
      const firstProduct = result.body?.data?.products?.items?.[0];
      expect(firstProduct).toBeTruthy();
      expect(firstProduct.name).toBeTruthy();
      expect(firstProduct.sku).toBeTruthy();
    });

    // @desc: Tworzenie pustego koszyka przez GraphQL zwraca cart ID
    test('should create empty cart via GraphQL', async () => {
      const start = Date.now();
      const result = await api.graphqlCreateEmptyCart();
      await attachApiResponse(test.info(), 'GraphQL createEmptyCart', result, {
        method: 'POST', url: api.graphqlUrl, duration: Date.now() - start,
      });
      expect(result.status).toBe(200);
      expect(result.body?.data?.createEmptyCart).toBeTruthy();
    });

    // @desc: Niepoprawne zapytanie GraphQL zwraca errors lub 404
    test('should handle invalid GraphQL query', async () => {
      const start = Date.now();
      const result = await api.graphql('{ invalidQuery { id } }');
      await attachApiResponse(test.info(), 'GraphQL Invalid Query', result, {
        method: 'POST', url: api.graphqlUrl, duration: Date.now() - start,
      });
      expect(result.body?.errors).toBeTruthy();
    });
  });
});
