import { CategoryPage } from '../../../core/pages/CategoryPage';

export class PieceofcaseCategoryPage extends CategoryPage {
  async navigate(path: string = ''): Promise<void> {
    await super.navigate(path);
    await this.page.evaluate(() => document.querySelectorAll('[id^="__pb"]').forEach(el => el.remove())).catch(() => {});
  }
}
