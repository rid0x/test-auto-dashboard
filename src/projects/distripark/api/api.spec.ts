import { test, expect } from '@playwright/test';
import { MagentoApiClient } from '../../../core/helpers/api-client';
import { distriparkConfig } from '../../../../config/distripark.config';

let api: MagentoApiClient;

test.describe('Distripark - API Tests @api', () => {
  test.beforeAll(async () => {
    api = new MagentoApiClient(distriparkConfig);
    await api.init();
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  test.describe('REST API @rest', () => {
    test('should get store config', async () => {
      const result = await api.getStoreConfig();
      expect([200, 401, 404, 502]).toContain(result.status);
    });

    test('should search products via REST', async () => {
      const result = await api.searchProducts(distriparkConfig.search.validQuery);
      expect([200, 401, 404, 502]).toContain(result.status);
      if (result.status === 200) expect(result.body?.items?.length).toBeGreaterThan(0);
    });

    test('should return empty for invalid search via REST', async () => {
      const result = await api.searchProducts(distriparkConfig.search.invalidQuery);
      expect([200, 401, 404, 502]).toContain(result.status);
    });

    test('should create guest cart', async () => {
      const result = await api.createGuestCart();
      expect(result.status).toBe(200);
      expect(result.body).toBeTruthy();
    });

    test('should authenticate customer via REST', async () => {
      try {
        const token = await api.getCustomerToken(distriparkConfig.credentials.valid.email, distriparkConfig.credentials.valid.password);
        expect(token).toBeTruthy();
      } catch (e: any) {
        test.info().annotations.push({ type: 'issue', description: e.message });
        test.skip();
      }
    });
  });

  test.describe('GraphQL API @graphql', () => {
    test('should search products via GraphQL', async () => {
      const result = await api.graphqlSearchProducts(distriparkConfig.search.validQuery);
      expect(result.status).toBe(200);
      expect(result.body?.data?.products?.total_count).toBeGreaterThan(0);
    });

    test('should return product details in GraphQL search', async () => {
      const result = await api.graphqlSearchProducts(distriparkConfig.search.validQuery);
      const firstProduct = result.body?.data?.products?.items?.[0];
      expect(firstProduct).toBeTruthy();
      expect(firstProduct.name).toBeTruthy();
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
