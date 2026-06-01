import { LocalStorageDict } from "./utils/storage_dict";

export async function requestHostPermissions(urls: string[]): Promise<boolean> {
  const origins = urls.map(url => new URL(url)).map(urlUrl => `${urlUrl.protocol}//${urlUrl.host}/*`);
  // Request permissions must happen during gesture!
  console.log(`Requesting permissions for origins: ${origins.join(', ')}`);
  try {
    const permission = await browser.permissions.request({ origins });
    console.log(`Permission for origins ${origins.join(', ')} ` + (permission ? 'granted!' : 'rejected!'));
    return permission;
  } catch (e) {
    console.error(`Failed to request permissions:`, e);
    return false;
  }
}

export const missingPermissionsStorage = new LocalStorageDict('missing_permissions');

export async function evaluateMissingPermissions(): Promise<string[]> {
  const missingPermissions = await missingPermissionsStorage.getValue();
  for (const url of Object.keys(missingPermissions)) {
    const urlUrl = new URL(url);
    const origin = `${urlUrl.protocol}//${urlUrl.host}/*`;
    const hasPermission = await browser.permissions.contains({ origins: [origin] });
    if (hasPermission) {
      console.log(`Permission for ${origin} has been granted, removing from missing permissions`);
      await missingPermissionsStorage.removeItem(url);
      delete missingPermissions[url];
    }
  }
  return Object.keys(missingPermissions);
}

export async function askForMissingPermissions(): Promise<boolean> {
  const missingDict = await missingPermissionsStorage.getValue();
  console.log(missingDict);
  const missing = Object.keys(missingDict);
  const gottem = await requestHostPermissions(missing);
  if (gottem) await evaluateMissingPermissions();
  return gottem;
}

export async function storeMissingPermissions(urls: string[]) {
  console.log(`Storing missing permissions for urls: ${urls.join(', ')}`);
  missingPermissionsStorage.updateItems(Object.fromEntries(urls.map(url => [url, true])));
}
