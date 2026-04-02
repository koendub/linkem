import { UserSettings } from '@/types';

export class LocalSettingsStorage {
  private static readonly STORAGE_KEY = 'linkem_settings';

  static async getSettings(): Promise<UserSettings> {
    const result = await browser.storage.local.get(this.STORAGE_KEY);
    // @ts-ignore
    return result[this.STORAGE_KEY] || { defaultLinkPosition: 'next_to_text' };
  }

  static async saveSettings(settings: UserSettings): Promise<void> {
    await browser.storage.local.set({ [this.STORAGE_KEY]: settings });
  }
}
