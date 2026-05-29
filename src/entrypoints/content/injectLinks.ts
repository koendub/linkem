import { getElementsByXPath } from '@/core/utils/xpath';
import { applyLinkToElement } from '@/core/inject';
import { linksStorage } from '@/core/storage/local_storage';
import { getFailingPostMatchConditions, getFailingPreMatchConditions } from '@/core/conditions';
import { injectCaller } from '@/core/utils/inject_caller';


export async function checkInjectLinks() {
  let anyInjected = false;
  try {
    const allLinks = Object.values(await linksStorage.getValue());
    for (const link of allLinks) {
      if (getFailingPreMatchConditions(link).length === 0) {
        const inElements = getElementsByXPath(link.on_xpath);
        for (const inElem of inElements) {
          if (getFailingPostMatchConditions(link, inElem).length === 0) {
            const thisInjected = await applyLinkToElement(link, inElem);
            anyInjected = anyInjected || thisInjected;
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to inject links:', error);
  }
  return anyInjected;
}

export function registerInjectLinks() {
  injectCaller(checkInjectLinks);
}
