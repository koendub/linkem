/**
 * Auto-generated Supabase types
 * These types are generated from the Supabase schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      links: {
        Row: {
          id: string
          user_id: string
          name: string
          href_path_format: string
          on_xpath: string
          on_selected_text_regex: string | null
          position: string
          display_name: string | null
          icon: string | null
          visibility: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          href_path_format: string
          on_xpath: string
          on_selected_text_regex?: string | null
          position: string
          display_name?: string | null
          icon?: string | null
          visibility?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          href_path_format?: string
          on_xpath?: string
          on_selected_text_regex?: string | null
          position?: string
          display_name?: string | null
          icon?: string | null
          visibility?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      conditions: {
        Row: {
          id: string
          link_id: string
          type: string
          value: string
          created_at: string
        }
        Insert: {
          id?: string
          link_id: string
          type: string
          value: string
          created_at?: string
        }
        Update: {
          id?: string
          link_id?: string
          type?: string
          value?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conditions_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          }
        ]
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          default_link_position: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          default_link_position?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          default_link_position?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

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
