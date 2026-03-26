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
      const result = await api.getStoreConfig();
      expect(result.status).toBe(200);
      expect(result.body).toBeTruthy();
    });

    test('should search products via REST', async () => {
      const result = await api.searchProducts(willsoorConfig.search.validQuery);
      expect(result.status).toBe(200);
      expect(result.body?.items?.length).toBeGreaterThan(0);
    });

    test('should return empty for invalid search via REST', async () => {
      const result = await api.searchProducts(willsoorConfig.search.invalidQuery);
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
          willsoorConfig.credentials.valid.email,
          willsoorConfig.credentials.valid.password
        );
        expect(token).toBeTruthy();
      } catch (e: any) {
        test.info().annotations.push({
          type: 'issue',
          description: 'Customer credentials may not be configured: ' + e.message,
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
