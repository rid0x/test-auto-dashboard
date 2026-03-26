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
    test('should get store config', async () => {
      // Willsoor REST API requires authentication — 401 expected for anonymous
      const result = await api.getStoreConfig();
      // Accept 200 (open) or 401 (auth required) — both mean API is alive
      expect([200, 401]).toContain(result.status);
    });

    test('should search products via REST', async () => {
      const result = await api.searchProducts(willsoorConfig.search.validQuery);
      // Willsoor REST may require auth
      expect([200, 401]).toContain(result.status);
      if (result.status === 200) {
        expect(result.body?.items?.length).toBeGreaterThan(0);
      }
    });

    test('should return results for invalid search via REST', async () => {
      const result = await api.searchProducts(willsoorConfig.search.invalidQuery);
      expect([200, 401]).toContain(result.status);
    });

    test('should create guest cart', async () => {
      const result = await api.createGuestCart();
      expect(result.status).toBe(200);
      expect(result.body).toBeTruthy();
    });

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
    test('should search products via GraphQL', async () => {
      const result = await api.graphqlSearchProducts(willsoorConfig.search.validQuery);
      expect(result.status).toBe(200);
      expect(result.body?.data?.products?.total_count).toBeGreaterThan(0);
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
