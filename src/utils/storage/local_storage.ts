import { LinkPackage, LinkWithConditions, UserSettingsValues } from "@/types/extra_types";

// Storage classes

export class LocalStorage<T> {
  private value: T | null = null;

  constructor(private storageKey: string) {}

  async getValue(forceReload: boolean = false): Promise<T> {
    if (!this.value || forceReload) {
      const stored = await browser.storage.local.get<{ [key: string]: T }>(this.storageKey);
      this.value = stored[this.storageKey] || null;
    }
    return this.value as T;
  }

  async setValue(value: T): Promise<void> {
    this.value = value;
    await this.writeValue();
  }

  async writeValue(): Promise<void> {
    await browser.storage.local.set({ [this.storageKey]: this.value });
  }
}

export class LocalStorageDict<D extends { [key: string]: any }> extends LocalStorage<D> {
  constructor(storageKey: string, private defaults: D = {} as D) {
    super(storageKey);
  }

  async getItem<V>(valueKey: string, defaultValue: V | undefined = undefined): Promise<V | undefined> {
    const dict = await this.getValue();
    return dict[valueKey] || this.defaults[valueKey] || defaultValue;
  }

  async setItem<V>(key: string, value: V): Promise<void> {
    const dict = await this.getValue() as { [key: string]: any };
    dict[key] = value;
    await this.writeValue();
  }
}

export class LocalStoragePerHost<V> {
  private valuesPerHosts: { [host: string]: LocalStorage<V> } = {};

  constructor(private storageKeyPrefix: string) {}

  private getHostStorage(host: string): LocalStorage<V> {
    if (!this.valuesPerHosts[host]) {
      this.valuesPerHosts[host] = new LocalStorage<V>(`${this.storageKeyPrefix}__${host}`);
    }
    return this.valuesPerHosts[host];
  }

  async getForHost(host: string): Promise<V> {
    return this.getHostStorage(host).getValue();
  }

  async setForHost(host: string, value: V): Promise<void> {
    await this.getHostStorage(host).setValue(value);
  }

  async getAll(): Promise<{ [host: string]: V }> {
    // This is a bit inefficient as it reads all keys, but browser.storage.local
    // doesn't support listing keys with a prefix. I think we will only use this class
    // for links, so almost all keys will be relevant, so it should be fine.
    const fullStorage = await browser.storage.local.get<{ [key: string]: any }>(null);
    const result: { [host: string]: V } = {};
    for (const key of Object.keys(fullStorage)) {
      if (key.startsWith(this.storageKeyPrefix + '__')) {
        const host = key.substring((this.storageKeyPrefix + '__').length);
        result[host] = fullStorage[key];
      }
    }
    return result;
  }
}

// Specific storages

export const settingsStorage = new LocalStorageDict<UserSettingsValues>('linkem_settings', { default_link_position: 'next_to_text' });

export const linksPerHostStorage = new LocalStoragePerHost<LinkWithConditions[]>('linkem_links');

export const packagesStorage = new LocalStorageDict<{ [packageId: string]: LinkPackage }>('linkem_imported_packages');
