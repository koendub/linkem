import { LocalStorage } from "@/core/utils/storage_dict";


export function useStorageValue<V>(
  storage: LocalStorage<V>,
  defaultValue: V,
  changed?: (val: V) => Promise<V | null>
): { value: V; isLoading: boolean; refresh: () => Promise<void>; setValue: (newValueOrUpdater: V | ((val: V | null) => V)) => void };

export function useStorageValue<V>(
  storage: LocalStorage<V>,
  defaultValue: null,
  changed?: (val: V) => Promise<V | null>
): { value: V | null; isLoading: boolean; refresh: () => Promise<void>; setValue: (newValueOrUpdater: V | ((val: V | null) => V)) => void };

export function useStorageValue<V>(
  storage: LocalStorage<V>,
  defaultValue: V | null = null,
  changed?: (val: V) => Promise<V | null>
) {
  const [storageValue, setStorageValue] = useState<{ value: V } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const val = await storage.getValue();
      const changedVal = val && changed ? await changed(val) : val;
      setStorageValue(changedVal ? { value: changedVal } : null);
    } finally {
      setIsLoading(false);
    }
  }, [storage]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setValue = useCallback(async (newValueOrUpdater: V | ((val: V | null) => V)) => {
    const newValue = typeof newValueOrUpdater === 'function'
      ? (newValueOrUpdater as (val: V | null) => V)(storageValue?.value || defaultValue)
      : newValueOrUpdater;
    setStorageValue({ value: newValue });
    storage.setValue(newValue)
      .catch(err => {
        console.error('Failed to save value to storage:', err);
      });
  }, [storage]);

  return { value: storageValue ? storageValue.value : defaultValue, isLoading, refresh, setValue };
}
