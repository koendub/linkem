import { askForMissingPermissions, evaluateMissingPermissions, missingPermissionsStorage, requestHostPermissions } from "@/core/permissions";
import { useStorageValue } from "./hooks/useStorage";
import { TriangleAlert } from "lucide-react";

export function ProblemsButton() {
  const [waitingForLoad, setWaitingForLoad] = useState(true);
  const { value } = useStorageValue(missingPermissionsStorage, {});

  useEffect(() => {
    evaluateMissingPermissions().finally(() => setWaitingForLoad(false))
  }, []);

  const missingPermissions = Object.keys(value);
  if (missingPermissions.length === 0) return null;
  if (waitingForLoad) return null;

  return (
    <button
    onClick={askForMissingPermissions}
    >
      <TriangleAlert size={20} color="red" />
    </button>
  );
}
