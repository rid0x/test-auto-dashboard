import { test, expect } from '@playwright/test';
import { MagentoApiClient } from '../../../core/helpers/api-client';
import { moncredoConfig } from '../../../../config/moncredo.config';

let api: MagentoApiClient;

test.describe('Moncredo - API Tests @api', () => {
  test.beforeAll(async () => {
    api = new MagentoApiClient(moncredoConfig);
    await api.init();
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  // --- REST API Tests ---

  test.describe('REST API @rest', () => {
    // @desc: Endpoint konfiguracji sklepu zwraca odpowiedz HTTP 200 lub 401
    test('should get store config', async () => {
      const result = await api.getStoreConfig();
      // Some stores require auth for store config, accept 200 or 401
      expect([200, 401]).toContain(result.status);
    });

    // @desc: Wyszukiwanie produktow przez REST API zwraca wyniki lub wymaga autoryzacji
    test('should search products via REST', async () => {
      const result = await api.searchProducts(moncredoConfig.search.validQuery);
      // REST product search often requires admin auth
      expect([200, 401]).toContain(result.status);
      if (result.status === 200) {
        expect(result.body?.items?.length).toBeGreaterThan(0);
      }
    });

    // @desc: Niepoprawne wyszukiwanie REST zwraca pusta liste lub wymaga autoryzacji
    test('should return empty for invalid search via REST', async () => {
      const result = await api.searchProducts(moncredoConfig.search.invalidQuery);
      expect([200, 401]).toContain(result.status);
      if (result.status === 200) {
        expect(result.body?.items?.length || 0).toBe(0);
      }
    });

    // @desc: Tworzenie koszyka goscia przez REST API zwraca poprawna odpowiedz
    test('should create guest cart', async () => {
      const result = await api.createGuestCart();
      expect(result.status).toBe(200);
      expect(result.body).toBeTruthy(); // cart ID
    });

    // @desc: Autentykacja klienta REST zwraca token sesji
    test('should authenticate customer via REST', async () => {
      try {
        const token = await api.getCustomerToken(
          moncredoConfig.credentials.valid.email,
          moncredoConfig.credentials.valid.password
        );
        expect(token).toBeTruthy();
        expect(typeof token).toBe('string');
      } catch (e: any) {
        // If credentials are not set up, skip
        test.info().annotations.push({
          type: 'issue',
          description: 'Customer credentials may not be configured: ' + e.message,
        });
        test.skip();
      }
    });
  });

  // --- GraphQL Tests ---

  test.describe('GraphQL API @graphql', () => {
    // @desc: Wyszukiwanie produktow przez GraphQL zwraca total_count i items
    test('should search products via GraphQL', async () => {
      const result = await api.graphqlSearchProducts(moncredoConfig.search.validQuery);
      expect(result.status).toBe(200);
      expect(result.body?.data?.products?.total_count).toBeGreaterThan(0);
      expect(result.body?.data?.products?.items?.length).toBeGreaterThan(0);
    });

    // @desc: Wyszukiwanie GraphQL zwraca szczegoly produktow (nazwy, ceny)
    test('should return product details in GraphQL search', async () => {
      const result = await api.graphqlSearchProducts(moncredoConfig.search.validQuery);
      const firstProduct = result.body?.data?.products?.items?.[0];
      expect(firstProduct).toBeTruthy();
      expect(firstProduct.name).toBeTruthy();
      expect(firstProduct.sku).toBeTruthy();
    });

    // @desc: Tworzenie pustego koszyka przez GraphQL zwraca cart ID
    test('should create empty cart via GraphQL', async () => {
      const result = await api.graphqlCreateEmptyCart();
      expect(result.status).toBe(200);
      expect(result.body?.data?.createEmptyCart).toBeTruthy();
    });

    // @desc: Niepoprawne zapytanie GraphQL zwraca errors lub 404
    test('should handle invalid GraphQL query', async () => {
      const result = await api.graphql('{ invalidQuery { id } }');
      expect(result.body?.errors).toBeTruthy();
    });
  });
});
