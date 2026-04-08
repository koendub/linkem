import { LocalStorage } from "../storage/local_base_storage";


export function useStorageValue<V>(storage: LocalStorage<V>, defaultValue: V): { value: V; isLoading: boolean; refresh: () => Promise<void> };

export function useStorageValue<V>(storage: LocalStorage<V>, defaultValue: null): { value: V | null; isLoading: boolean; refresh: () => Promise<void> };

export function useStorageValue<V>(storage: LocalStorage<V>, defaultValue: V | null = null) {
  const [value, setValue] = useState<V | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const val = await storage.getValue();
      setValue(val);
    } finally {
      setIsLoading(false);
    }
  }, [storage]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { value: value || defaultValue, isLoading, refresh };
}
