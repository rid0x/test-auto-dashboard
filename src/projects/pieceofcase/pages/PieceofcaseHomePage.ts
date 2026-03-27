import { HomePage } from '../../../core/pages/HomePage';

export class PieceofcaseHomePage extends HomePage {
  async navigate(path: string = ''): Promise<void> {
    await super.navigate(path);
    await this.page.evaluate(() => document.querySelectorAll('[id^="__pb"]').forEach(el => el.remove())).catch(() => {});
  }
}
