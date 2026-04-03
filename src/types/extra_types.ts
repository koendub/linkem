import { Database, Tables } from "./supabase";

// Type helpers
export type Profile = Tables<'profiles'>;
export type Link = Tables<'links'>;
export type Condition = Tables<'conditions'> & { type: 'url_start' | 'url_contains' | 'xpath_exists' | 'value_match' };
export type UserSettings = Tables<'user_settings'>;
export type LinkPackage = Tables<'link_packages'>;
export type LinkPackageLink = Tables<'link_package_links'>;

export type LinkInsert = Database['public']['Tables']['links']['Insert']
export type ConditionInsert = Database['public']['Tables']['conditions']['Insert']
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert']
export type LinkPackageInsert = Database['public']['Tables']['link_packages']['Insert']
export type LinkPackageLinkInsert = Database['public']['Tables']['link_package_links']['Insert']

// Link with conditions joined
export interface LinkWithConditions extends Link {
  conditions: Condition[]
}

export type UnstoredLinkWithConditions = Omit<LinkWithConditions, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UserSettingsValues = Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Link Package with conditions joined
export interface LinkPackageWithLinks extends LinkPackage {
  links: LinkWithConditions[]
}

export type UnstoredLinkPackage = Omit<LinkPackage, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Export format for sharing - derived from actual types
export type ExportedLink = Omit<Link, 'id' | 'user_id' | 'created_at' | 'updated_at'> & {
  conditions: Array<Pick<Condition, 'type' | 'value'>>
};

export type ExportedLinkPackage = Pick<LinkPackage, 'name'> & {
  links: ExportedLink[]
};
