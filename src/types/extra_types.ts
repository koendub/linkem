import { LinkWithConditions } from "./supabase";

export type UnstoredLinkWithConditions = Omit<LinkWithConditions, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
