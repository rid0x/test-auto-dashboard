import { HomePage } from '../../../core/pages/HomePage';
import { setupPbPopupAutoDismiss } from '../../../core/helpers/cookie-consent';

export class PieceofcaseHomePage extends HomePage {
  async navigate(path: string = ''): Promise<void> {
    await super.navigate(path);
    await setupPbPopupAutoDismiss(this.page);
  }
}
