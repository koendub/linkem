import { Database, Tables } from "./supabase";

// Type helpers
export type Profile = Tables<'profiles'>;
export type Link = Tables<'links'>;
export type Condition = Tables<'conditions'> & { type: 'url_start' | 'url_contains' | 'xpath_exists' | 'value_match' };
export type UserSettings = Tables<'user_settings'>;

export type LinkInsert = Database['public']['Tables']['links']['Insert']
export type ConditionInsert = Database['public']['Tables']['conditions']['Insert']
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert']

// Link with conditions joined
export interface LinkWithConditions extends Link {
  conditions: Condition[]
}

export type UnstoredLinkWithConditions = Omit<LinkWithConditions, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UserSettingsValues = Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
