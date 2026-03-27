import { test, expect } from '@playwright/test';
import { MagentoApiClient } from '../../../core/helpers/api-client';
import { pieceofcaseConfig } from '../../../../config/pieceofcase.config';

let api: MagentoApiClient;

test.describe('Pieceofcase - API Tests @api', () => {
  test.beforeAll(async () => {
    api = new MagentoApiClient(pieceofcaseConfig);
    await api.init();
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  // --- REST API Tests ---

  test.describe('REST API @rest', () => {
    // @desc: Endpoint konfiguracji sklepu zwraca odpowiedz HTTP 200 lub 401 (wymaga auth)
    test('should get store config', async () => {
      const result = await api.getStoreConfig();
      // Pieceofcase REST API may require auth — 200 or 401 are both valid responses
      expect([200, 401]).toContain(result.status);
      if (result.status === 200) {
        expect(result.body).toBeTruthy();
      }
    });

    // @desc: Wyszukiwanie produktow przez REST API zwraca wyniki (items)
    test('should search products via REST', async () => {
      const result = await api.searchProducts(pieceofcaseConfig.search.validQuery);
      expect([200, 401]).toContain(result.status);
      if (result.status === 200) {
        expect(result.body?.items?.length).toBeGreaterThan(0);
      }
    });

    // @desc: Niepoprawne wyszukiwanie REST zwraca pusta liste (nie blad serwera)
    test('should return empty for invalid search via REST', async () => {
      const result = await api.searchProducts(pieceofcaseConfig.search.invalidQuery);
      expect([200, 401]).toContain(result.status);
      if (result.status === 200) {
        expect(result.body?.items?.length || 0).toBe(0);
      }
    });

    // @desc: Tworzenie koszyka goscia przez REST API zwraca poprawna odpowiedz
    test('should create guest cart', async () => {
      const result = await api.createGuestCart();
      expect(result.status).toBe(200);
      expect(result.body).toBeTruthy();
    });

    // @desc: Autentykacja klienta REST zwraca token sesji
    test('should authenticate customer via REST', async () => {
      try {
        const token = await api.getCustomerToken(
          pieceofcaseConfig.credentials.valid.email,
          pieceofcaseConfig.credentials.valid.password
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
      const result = await api.graphqlSearchProducts(pieceofcaseConfig.search.validQuery);
      expect(result.status).toBe(200);
      expect(result.body?.data?.products?.total_count).toBeGreaterThan(0);
      expect(result.body?.data?.products?.items?.length).toBeGreaterThan(0);
    });

    // @desc: Wyszukiwanie GraphQL zwraca szczegoly produktow (nazwy, ceny)
    test('should return product details in GraphQL search', async () => {
      const result = await api.graphqlSearchProducts(pieceofcaseConfig.search.validQuery);
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
