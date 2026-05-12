import { createClient } from '@supabase/supabase-js'
import { Database, Link, Condition, LinkWithConditions } from '@/core/types'
import { settingsStorage } from './local_storage'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export function hasSupabaseConfig() {
  return !!supabaseUrl && !!supabaseKey
}

async function createSupabaseClient() {
  if (!hasSupabaseConfig()) {
    throw new Error('Supabase environment variables not configured')
  }
  const allowNetworking = await settingsStorage.getItem('allowNetworking', false);
  if (!allowNetworking) {
    throw new Error('Networking features are disabled in settings. Cannot initialize client.')
  }
  const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
  return supabase;
}

/**
 * Supabase-based storage manager for links and settings
 * All operations use RLS for security - no backend needed
 */
export class SupabaseStorage {
  /**
   * Get the current authenticated user
   */
  static async getCurrentUser() {
    const supabase = await createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Failed to get current user:', error)
      return null
    }
    return user
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return !!user
  }

  /**
   * Get all links for the current user
   * Uses RLS to only return links the user has access to
   */
  static async getAllLinks(): Promise<LinkWithConditions[]> {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get all links for the user
    const supabase = await createSupabaseClient();
    const { data: links, error: linksError } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (linksError) {
      throw new Error(`Failed to fetch links: ${linksError.message}`)
    }

    if (!links || links.length === 0) {
      return []
    }

    // Get all conditions for these links
    const linkIds = links.map(l => l.id)
    const { data: conditions, error: conditionsError } = await supabase
      .from('conditions')
      .select('*')
      .in('link_id', linkIds)
      .order('created_at', { ascending: true })

    if (conditionsError) {
      throw new Error(`Failed to fetch conditions: ${conditionsError.message}`)
    }

    // Group conditions by link_id
    const conditionsByLinkId = (conditions as Condition[] || []).reduce((acc: Record<string, Condition[]>, cond) => {
      if (!acc[cond.link_id]) {
        acc[cond.link_id] = []
      }
      acc[cond.link_id].push(cond)
      return acc
    }, {})

    // Combine links with their conditions
    return (links as Link[]).map(link => ({
      ...link,
      conditions: conditionsByLinkId[link.id] || []
    }))
  }

  /**
   * Get a single link with its conditions
   */
  static async getLink(linkId: string): Promise<LinkWithConditions | null> {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const supabase = await createSupabaseClient();
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('*')
      .eq('id', linkId)
      .eq('user_id', user.id)
      .single()

    if (linkError) {
      if (linkError.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Failed to fetch link: ${linkError.message}`)
    }

    const { data: conditions, error: conditionsError } = await supabase
      .from('conditions')
      .select('*')
      .eq('link_id', linkId)
      .order('created_at', { ascending: true })

    if (conditionsError) {
      throw new Error(`Failed to fetch conditions: ${conditionsError.message}`)
    }

    return {
      ...(link as Link),
      conditions: (conditions as Condition[]) || []
    }
  }

  /**
   * Save a link with its conditions
   * If the link has an id, it updates the existing link
   * Otherwise, creates a new link
   */
  static async saveLink(link: LinkWithConditions): Promise<LinkWithConditions> {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    let savedLink: Link

    const supabase = await createSupabaseClient();
    if (link.id) {
      // Update existing link
      const { data, error } = await supabase
        .from('links')
        .update({
          name: link.name,
          href_format: link.href_format,
          on_xpath: link.on_xpath,
          on_selected_text_regex: link.on_selected_text_regex,
          position: link.position,
          display_name: link.display_name,
          icon: link.icon,
          visibility: link.visibility,
          updated_at: new Date().toISOString()
        })
        .eq('id', link.id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update link: ${error.message}`)
      }

      savedLink = data as Link
    } else {
      // Create new link
      const { data, error } = await supabase
        .from('links')
        .insert({
          user_id: user.id,
          name: link.name,
          href_format: link.href_format,
          on_xpath: link.on_xpath,
          on_selected_text_regex: link.on_selected_text_regex,
          position: link.position,
          display_name: link.display_name,
          icon: link.icon,
          visibility: link.visibility
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create link: ${error.message}`)
      }

      savedLink = data as Link
    }

    // Handle conditions - delete old ones and insert new ones
    if (link.conditions && link.conditions.length > 0) {
      // Delete existing conditions for this link
      const { error: deleteError } = await supabase
        .from('conditions')
        .delete()
        .eq('link_id', savedLink.id)

      if (deleteError) {
        throw new Error(`Failed to delete old conditions: ${deleteError.message}`)
      }

      // Insert new conditions
      const conditionsToInsert = link.conditions.map(({ id, created_at, ...cond }) => ({
        ...cond,
        link_id: savedLink.id
      }))

      const { error: insertError } = await supabase
        .from('conditions')
        .insert(conditionsToInsert)

      if (insertError) {
        throw new Error(`Failed to insert conditions: ${insertError.message}`)
      }
    }

    // Fetch updated link with conditions
    return (await this.getLink(savedLink.id)) as LinkWithConditions
  }

  /**
   * Delete a link and its conditions
   */
  static async deleteLink(linkId: string): Promise<void> {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Conditions will be deleted automatically due to CASCADE foreign key
    const supabase = await createSupabaseClient();
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', linkId)
      .eq('user_id', user.id)

    if (error) {
      throw new Error(`Failed to delete link: ${error.message}`)
    }
  }

  /**
   * Send OTP to email
   * Sends a one-time password to the provided email address
   */
  static async sendOtp(email: string): Promise<void> {
    const supabase = await createSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      }
    })
    if (error) {
      throw new Error(`Failed to send OTP: ${error.message}`)
    }
  }

  /**
   * Verify OTP token from email link
   */
  static async verifyOtp(email: string, token: string): Promise<void> {
    const supabase = await createSupabaseClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    })
    if (error) {
      throw new Error(`Failed to verify OTP: ${error.message}`)
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<void> {
    const supabase = await createSupabaseClient();
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(`Failed to sign out: ${error.message}`)
    }
  }

  /**
   * Listen to auth state changes
   */
  static async onAuthStateChange(callback: (event: string, session: any) => void) {
    const supabase = await createSupabaseClient();
    return supabase.auth.onAuthStateChange(callback)
  }
}
