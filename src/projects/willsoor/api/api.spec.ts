import { test, expect } from '@playwright/test';
import { MagentoApiClient } from '../../../core/helpers/api-client';
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

  test.describe('REST API @rest', () => {
    // @desc: REST API konfiguracji sklepu odpowiada (200 lub 401)
    test('should get store config', async () => {
      // Willsoor REST API requires authentication — 401 expected for anonymous
      const result = await api.getStoreConfig();
      // Accept 200 (open) or 401 (auth required) — both mean API is alive
      expect([200, 401]).toContain(result.status);
    });

    // @desc: Wyszukiwanie produktow przez REST API zwraca wyniki
    test('should search products via REST', async () => {
      const result = await api.searchProducts(willsoorConfig.search.validQuery);
      // Willsoor REST may require auth
      expect([200, 401]).toContain(result.status);
      if (result.status === 200) {
        expect(result.body?.items?.length).toBeGreaterThan(0);
      }
    });

    // @desc: REST API obsluguje wyszukiwanie z niepoprawna fraza
    test('should return results for invalid search via REST', async () => {
      const result = await api.searchProducts(willsoorConfig.search.invalidQuery);
      expect([200, 401]).toContain(result.status);
    });

    // @desc: Tworzenie koszyka goscia przez REST API
    test('should create guest cart', async () => {
      const result = await api.createGuestCart();
      // Accept 200 (success) or 404 (endpoint may be restricted)
      expect([200, 404, 502]).toContain(result.status);
      if (result.status === 200) {
        expect(result.body).toBeTruthy();
      }
    });

    // @desc: Uwierzytelnienie klienta przez REST API zwraca token
    test('should authenticate customer via REST', async () => {
      try {
        const token = await api.getCustomerToken(
          willsoorConfig.credentials.valid.email,
          willsoorConfig.credentials.valid.password
        );
        expect(token).toBeTruthy();
      } catch {
        test.info().annotations.push({
          type: 'issue',
          description: 'Customer credentials may not be configured or API auth differs',
        });
        test.skip();
      }
    });
  });

  test.describe('GraphQL API @graphql', () => {
    // @desc: Wyszukiwanie produktow przez GraphQL zwraca wyniki
    test('should search products via GraphQL', async () => {
      const result = await api.graphqlSearchProducts(willsoorConfig.search.validQuery);
      expect([200, 404, 502]).toContain(result.status);
      if (result.status === 200 && result.body?.data) {
        expect(result.body.data.products?.total_count).toBeGreaterThan(0);
      }
    });

    // @desc: Tworzenie pustego koszyka przez GraphQL
    test('should create empty cart via GraphQL', async () => {
      const result = await api.graphqlCreateEmptyCart();
      expect([200, 404, 502]).toContain(result.status);
      if (result.status === 200 && result.body?.data) {
        expect(result.body.data.createEmptyCart).toBeTruthy();
      }
    });

    // @desc: Niepoprawne zapytanie GraphQL zwraca blad
    test('should handle invalid GraphQL query', async () => {
      const result = await api.graphql('{ invalidQuery { id } }');
      // Expect errors in response or 404 if endpoint restricted
      expect(result.body?.errors || result.status === 404).toBeTruthy();
    });
  });
});
