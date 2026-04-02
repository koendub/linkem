import { UserSettings, UserSettingsValues } from '@/types';

export class LocalSettingsStorage {
  private static readonly STORAGE_KEY = 'linkem_settings';

  static async getSettings(): Promise<UserSettingsValues> {
    const result = await browser.storage.local.get(this.STORAGE_KEY);
    // @ts-ignore
    const settings: UserSettingsValues | undefined = result[this.STORAGE_KEY];
    return settings || { default_link_position: 'next_to_text' };
  }

  static async saveSettings(settings: UserSettingsValues): Promise<void> {
    await browser.storage.local.set({ [this.STORAGE_KEY]: settings });
  }
}
