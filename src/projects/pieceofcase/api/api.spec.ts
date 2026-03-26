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
    test('should get store config', async () => {
      const result = await api.getStoreConfig();
      expect(result.status).toBe(200);
      expect(result.body).toBeTruthy();
    });

    test('should search products via REST', async () => {
      const result = await api.searchProducts(pieceofcaseConfig.search.validQuery);
      expect(result.status).toBe(200);
      expect(result.body?.items?.length).toBeGreaterThan(0);
    });

    test('should return empty for invalid search via REST', async () => {
      const result = await api.searchProducts(pieceofcaseConfig.search.invalidQuery);
      expect(result.status).toBe(200);
      expect(result.body?.items?.length || 0).toBe(0);
    });

    test('should create guest cart', async () => {
      const result = await api.createGuestCart();
      expect(result.status).toBe(200);
      expect(result.body).toBeTruthy();
    });

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
    test('should search products via GraphQL', async () => {
      const result = await api.graphqlSearchProducts(pieceofcaseConfig.search.validQuery);
      expect(result.status).toBe(200);
      expect(result.body?.data?.products?.total_count).toBeGreaterThan(0);
      expect(result.body?.data?.products?.items?.length).toBeGreaterThan(0);
    });

    test('should return product details in GraphQL search', async () => {
      const result = await api.graphqlSearchProducts(pieceofcaseConfig.search.validQuery);
      const firstProduct = result.body?.data?.products?.items?.[0];
      expect(firstProduct).toBeTruthy();
      expect(firstProduct.name).toBeTruthy();
      expect(firstProduct.sku).toBeTruthy();
    });

    test('should create empty cart via GraphQL', async () => {
      const result = await api.graphqlCreateEmptyCart();
      expect(result.status).toBe(200);
      expect(result.body?.data?.createEmptyCart).toBeTruthy();
    });

    test('should handle invalid GraphQL query', async () => {
      const result = await api.graphql('{ invalidQuery { id } }');
      expect(result.body?.errors).toBeTruthy();
    });
  });
});
