
export class LocalStorage<T> {
  private value: T | null = null;

  constructor(private storageKey: string) {}

  async getValue(forceReload: boolean = false): Promise<T | null> {
    if (!this.value || forceReload) {
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
    return (await this.getItems([valueKey], defaultValue === undefined ? {} : { [valueKey]: defaultValue } as Record<string, V>))[valueKey];
  }

  async getItems<V>(valueKeys: string[], defaultValues: Record<string, V> = {}): Promise<Record<string, V>> {
    const dict = await this.getValue() || {} as D;
    const result: Record<string, V> = {};
    for (const key of valueKeys) {
      result[key] = (dict && dict[key]) || this.defaults[key] || defaultValues[key];
    }
    return result;
  }

  async updateItems(updates: Partial<D>): Promise<void> {
    const dict = await this.getValue() || {} as D;
    await this.setValue(Object.assign(dict, updates));
  }

  async removeItem(key: string): Promise<void> {
    const dict = await this.getValue() || {} as D;
    delete dict[key];
    await this.setValue(dict);
  }
}

export class LocalIdStorageDict<V extends { id: string }> extends LocalStorageDict<{ [id: string]: V }> {
  async updateValues(values: V[]): Promise<void> {
    await super.updateItems(Object.fromEntries(values.map(v => [v.id, v])));
  }
}
