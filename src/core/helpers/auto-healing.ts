import { Page, Locator } from '@playwright/test';

export interface HealableLocator {
  primary: string;
  fallbacks: string[];
  description: string;
}

/**
 * Auto-healing locator strategy.
 * Tries primary selector first, then falls through fallbacks.
 * Logs which selector actually worked so you know when healing kicked in.
 */
export async function findElement(
  page: Page,
  locator: HealableLocator,
  options: { timeout?: number; state?: 'visible' | 'attached' | 'hidden' } = {}
): Promise<Locator> {
  const timeout = options.timeout ?? 5000;
  const state = options.state ?? 'visible';

  // Try primary first
  try {
    const el = page.locator(locator.primary);
    await el.first().waitFor({ timeout, state });
    return el.first();
  } catch {
    // Primary failed, try fallbacks
  }

  // Try each fallback
  for (const fallback of locator.fallbacks) {
    try {
      const el = page.locator(fallback);
      await el.first().waitFor({ timeout: 2000, state });
      console.warn(
        `[AUTO-HEAL] "${locator.description}" — primary selector failed: "${locator.primary}". ` +
        `Healed with fallback: "${fallback}"`
      );
      return el.first();
    } catch {
      // This fallback failed too, try next
    }
  }

  // Nothing worked — throw with useful info
  const allSelectors = [locator.primary, ...locator.fallbacks];
  throw new Error(
    `[AUTO-HEAL FAILED] "${locator.description}" — none of the selectors worked:\n` +
    allSelectors.map((s, i) => `  ${i === 0 ? 'primary' : `fallback ${i}`}: ${s}`).join('\n')
  );
}

/**
 * Quick helper to build a HealableLocator
 */
export function healable(
  description: string,
  primary: string,
  ...fallbacks: string[]
): HealableLocator {
  return { primary, fallbacks, description };
}
