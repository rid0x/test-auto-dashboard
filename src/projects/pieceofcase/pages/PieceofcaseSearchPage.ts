import { SearchPage } from '../../../core/pages/SearchPage';

export class PieceofcaseSearchPage extends SearchPage {
  async navigate(path: string = ''): Promise<void> {
    await super.navigate(path);
    await this.page.evaluate(() => document.querySelectorAll('[id^="__pb"]').forEach(el => el.remove())).catch(() => {});
  }
}
