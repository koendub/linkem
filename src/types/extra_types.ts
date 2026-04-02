import { Database } from "./supabase";

// Type helpers
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Link = Database['public']['Tables']['links']['Row']
export type Condition = Database['public']['Tables']['conditions']['Row']
export type UserSettings = Database['public']['Tables']['user_settings']['Row']

export type LinkInsert = Database['public']['Tables']['links']['Insert']
export type ConditionInsert = Database['public']['Tables']['conditions']['Insert']
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert']

// Link with conditions joined
export interface LinkWithConditions extends Link {
  conditions: Condition[]
}

export type UnstoredLinkWithConditions = Omit<LinkWithConditions, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
