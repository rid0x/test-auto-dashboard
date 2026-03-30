import { SearchPage } from '../../../core/pages/SearchPage';
import { setupPbPopupAutoDismiss } from '../../../core/helpers/cookie-consent';

export class PieceofcaseSearchPage extends SearchPage {
  async navigate(path: string = ''): Promise<void> {
    await super.navigate(path);
    await setupPbPopupAutoDismiss(this.page);
  }
}
