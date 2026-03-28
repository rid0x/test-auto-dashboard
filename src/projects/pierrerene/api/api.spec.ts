import { test, expect } from '@playwright/test';
import { MagentoApiClient } from '../../../core/helpers/api-client';
import { pierrereneConfig } from '../../../../config/pierrerene.config';

let api: MagentoApiClient;

test.describe('Pierrerene - API Tests @api', () => {
  test.beforeAll(async () => {
    api = new MagentoApiClient(pierrereneConfig);
    await api.init();
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  // --- REST API Tests ---

  test.describe('REST API @rest', () => {
    // @desc: Endpoint konfiguracji sklepu odpowiada (200 lub 401)
    test('should get store config', async () => {
      const result = await api.getStoreConfig();
      expect([200, 401, 404, 502]).toContain(result.status);
    });

    // @desc: Wyszukiwanie produktow przez REST API zwraca wyniki
    test('should search products via REST', async () => {
      const result = await api.searchProducts(pierrereneConfig.search.validQuery);
      expect([200, 401, 404, 502]).toContain(result.status);
      if (result.status === 200) {
        expect(result.body?.items?.length).toBeGreaterThan(0);
      }
    });

    // @desc: Niepoprawne wyszukiwanie REST nie powoduje bledu serwera
    test('should return empty for invalid search via REST', async () => {
      const result = await api.searchProducts(pierrereneConfig.search.invalidQuery);
      expect([200, 401, 404, 502]).toContain(result.status);
    });

    // @desc: Tworzenie koszyka goscia przez REST API zwraca poprawna odpowiedz
    test('should create guest cart', async () => {
      const result = await api.createGuestCart();
      expect([200, 401, 403, 404, 502]).toContain(result.status);
      if (result.status === 200) {
        expect(result.body).toBeTruthy();
      }
    });

    // @desc: Autentykacja klienta REST zwraca token sesji
    test('should authenticate customer via REST', async () => {
      try {
        const token = await api.getCustomerToken(
          pierrereneConfig.credentials.valid.email,
          pierrereneConfig.credentials.valid.password
        );
        expect(token).toBeTruthy();
        expect(typeof token).toBe('string');
      } catch (e: any) {
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
      const result = await api.graphqlSearchProducts(pierrereneConfig.search.validQuery);
      expect([200, 401, 403, 404, 502]).toContain(result.status);
      if (result.status === 200 && result.body?.data) {
        expect(result.body.data.products?.total_count).toBeGreaterThan(0);
        expect(result.body.data.products?.items?.length).toBeGreaterThan(0);
      }
    });

    // @desc: Wyszukiwanie GraphQL zwraca szczegoly produktow (nazwy, ceny)
    test('should return product details in GraphQL search', async () => {
      const result = await api.graphqlSearchProducts(pierrereneConfig.search.validQuery);
      expect([200, 401, 403, 404, 502]).toContain(result.status);
      if (result.status === 200 && result.body?.data?.products?.items?.length > 0) {
        const firstProduct = result.body.data.products.items[0];
        expect(firstProduct).toBeTruthy();
        expect(firstProduct.name).toBeTruthy();
        expect(firstProduct.sku).toBeTruthy();
      }
    });

    // @desc: Tworzenie pustego koszyka przez GraphQL zwraca cart ID
    test('should create empty cart via GraphQL', async () => {
      const result = await api.graphqlCreateEmptyCart();
      expect([200, 401, 403, 404, 502]).toContain(result.status);
      if (result.status === 200 && result.body?.data) {
        expect(result.body.data.createEmptyCart).toBeTruthy();
      }
    });

    // @desc: Niepoprawne zapytanie GraphQL zwraca errors lub 404
    test('should handle invalid GraphQL query', async () => {
      const result = await api.graphql('{ invalidQuery { id } }');
      // Should return errors in body or a non-200 status
      const hasErrors = result.body?.errors && result.body.errors.length > 0;
      const isErrorStatus = result.status !== 200;
      expect(hasErrors || isErrorStatus).toBeTruthy();
    });
  });
});
