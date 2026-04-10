import { LocalUserSettingsValues } from "@/core/types/extra_types";

// Storage classes

export class LocalStorage<T> {
  private value: T | null = null;

  constructor(private storageKey: string) {}

  async getValue(forceReload: boolean = false): Promise<T | null> {
    if (!this.value || forceReload) {
      console.log(`Loading value for key ${this.storageKey} from local storage`);
      const stored = await browser.storage.local.get<{ [key: string]: T }>(this.storageKey);
      this.value = stored[this.storageKey] || null;
    }
    return (this.value) as T | null;
  }

  async setValue(value: T): Promise<void> {
    this.value = value;
    await this.writeValue();
  }

  private async writeValue(): Promise<void> {
    await browser.storage.local.set({ [this.storageKey]: this.value });
  }
}

export class LocalStorageDict<D extends { [key: string]: any }> extends LocalStorage<D> {
  constructor(storageKey: string, private defaults: Partial<D> = {} as D) {
    super(storageKey);
  }

  async getValue(forceReload: boolean = false): Promise<D> {
    const value = await super.getValue(forceReload);
    return Object.assign({}, this.defaults, value || {}) as D;
  }

  async getItem<V>(valueKey: string, defaultValue: V | undefined = undefined): Promise<V | undefined> {
    const dict = await this.getValue() || {} as D;
    return (dict && dict[valueKey]) || this.defaults[valueKey] || defaultValue;
  }

  async updateItems(updates: Partial<D>): Promise<void> {
    const dict = await this.getValue() || {} as D;
    await this.setValue(Object.assign(dict, updates));
  }

  async removeItem(key: string): Promise<void> {
    const dict = await this.getValue() || {} as D;
    delete dict[key];
    console.log(`Removing key ${key} from local storage dict, now there are keys: ${Object.keys(dict).join(', ')}`);
    await this.setValue(dict);
  }
}

// Specific storages

export const settingsStorage = new LocalStorageDict<LocalUserSettingsValues>('linkem_settings', { default_link_position: 'next_to_text' });

settingsStorage.getItem('localUserId').then(id => {
  if (!id) {
    const newId = 'local-' + crypto.randomUUID();
    settingsStorage.updateItems({ localUserId: newId });
  }
});
