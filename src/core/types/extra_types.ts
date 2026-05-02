import { Database, Tables } from "./supabase";

/////////////////////////////////////////////////////////// Database types

// Type helpers, like in database
export type Profile = Tables<'profiles'>;
export type Link = Tables<'links'>;
export type Condition = Tables<'conditions'> & { type: 'url_start' | 'url_contains' | 'xpath_exists' | 'value_match' | 'text_contains' };
export type UserSettings = Tables<'user_settings'>;
export type LinkPackageBase = Tables<'link_packages'>;
export type LinkPackageLink = Tables<'link_package_links'>;

// Type helpers for database inserts (without auto-generated fields)
export type LinkInsert = Database['public']['Tables']['links']['Insert']
export type ConditionInsert = Database['public']['Tables']['conditions']['Insert']
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert']
export type LinkPackageInsert = Database['public']['Tables']['link_packages']['Insert']
export type LinkPackageLinkInsert = Database['public']['Tables']['link_package_links']['Insert']

/////////////////////////////////////////////////////////// Custom types

// Custom link types
export type LinkWithConditions = Link & { conditions: Condition[] };
export type UnstoredLinkWithConditions = Omit<LinkWithConditions, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Custom link package types
export type LinkPackage = LinkPackageBase & { linkIds: string[] };
export type LinkPackageWithLinks = LinkPackageBase & { links: LinkWithConditions[] };
export type UnstoredLinkPackage = Omit<LinkPackage, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Other custom types
export type UserSettingsValues = Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type LocalUserSettingsValues = UserSettingsValues & { localUserId: string, allowNetworking: boolean };
