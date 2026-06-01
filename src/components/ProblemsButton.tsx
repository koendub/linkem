import { askForMissingPermissions, missingPermissionsStorage, requestHostPermissions } from "@/core/permissions";
import { useStorageValue } from "./hooks/useStorage";
import { TriangleAlert } from "lucide-react";

export function ProblemsButton() {
  const { value } = useStorageValue(missingPermissionsStorage, {});
  const missingPermissions = Object.keys(value);
  if (missingPermissions.length === 0) return null;

  return (
    <button
    onClick={askForMissingPermissions}
    >
      <TriangleAlert size={20} color="red" />
    </button>
  );
}
