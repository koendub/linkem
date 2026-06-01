import { LocalStorage } from "@/core/utils/storage_dict";


export function useStorageValue<V>(
  storage: LocalStorage<V>,
  defaultValue: V,
  transform?: (val: V) => Promise<V | null>
): { value: V; isLoading: boolean };

export function useStorageValue<V>(
  storage: LocalStorage<V>,
  defaultValue: null,
  transform?: (val: V) => Promise<V | null>
): { value: V | null; isLoading: boolean };

export function useStorageValue<V>(
  storage: LocalStorage<V>,
  defaultValue: V | null = null,
  transform?: (val: V) => Promise<V | null>
) {
  const [storageValue, setStorageValue] = useState<{ value: V } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const val = await storage.getValue();
        const transformedVal = val && transform ? await transform(val) : val;
        setStorageValue(transformedVal ? { value: transformedVal } : null);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [storage]);

  useEffect(() => {
    return storage.addChangeListener(async (newValue) => {
      const transformedVal = newValue && transform ? await transform(newValue) : newValue;
      setStorageValue(transformedVal ? { value: transformedVal } : null);
    });
  }, [storage]);

  return { value: storageValue ? storageValue.value : defaultValue, isLoading };
}
