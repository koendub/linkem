import { ExportedLinkPackage, ExportedLink, LinkPackage, LinkWithConditions, Link } from "@/types";
import React from "react";

export function importFromBase64(encoded: string): LinkPackage | LinkWithConditions {
  const isPackage = (data: unknown): data is ExportedLinkPackage => {
    return (
      typeof data === 'object' &&
      data !== null &&
      'name' in data &&
      'links' in data &&
      Array.isArray((data as any).links)
    );
  };

  const isSingleLink = (data: unknown): data is ExportedLink => {
    return (
      typeof data === 'object' &&
      data !== null &&
      'name' in data &&
      'href_path_format' in data &&
      'conditions' in data &&
      Array.isArray((data as any).conditions)
    );
  };
5
  try {
    const jsonString = atob(encoded);
    const obj = JSON.parse(jsonString);
  } catch (e) {
    throw new Error('Invalid base64 string or JSON format');
  }
  
  if (isPackage(obj)) {
  } else if (isSingleLink(obj)) {
  } else {
    throw new Error('Invalid format: must be a link package or single link');
  }
}

export function exportToBase64(data: LinkPackage | LinkWithConditions): string {
  if (data instanceof LinkPackage) {
    
  } else if ('conditions' in data) {
    const link = data as LinkWithConditions;
    const exportData = {
      name: link.name,
      href_path_format: link.href_path_format,
      display_name: link.display_name,
      on_xpath: link.on_xpath,
      on_selected_text_regex: link.on_selected_text_regex,
      position: link.position,
      icon: link.icon,
      visibility: link.visibility,
      conditions: link.conditions.map(c => ({
        type: c.type,
        value: c.value,
      })),
    }
    const jsonString = JSON.stringify(exportData);
    return btoa(jsonString);
  } else {
    throw new Error('Unsupported data type for export');
  }
}

export function fetchRemoteLinks(id: string) {

}

export function publishLinksRemotely(links: LinkPackage | LinkWithConditions) {
}
