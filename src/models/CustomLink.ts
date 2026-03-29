import { LinkCondition } from "./LinkCondition";
import { LinkLocation } from "./LinkLocation";

export interface CustomLink {
  // Basic info
  id: string;
  name: string;
  creator: string;
  visibility: 'private' | 'public';
  createdAt: Date;

  // Link content
  location: LinkLocation;
  hrefPathFormat: string;
  conditions: LinkCondition[];
}
