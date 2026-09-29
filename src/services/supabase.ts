import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export class SupabaseService {
  static getConfig() {
    return {
      url: localStorage.getItem('grand_supabase_url') || supabaseUrl || '',
      anonKey: localStorage.getItem('grand_supabase_anon_key') || supabasePublishableKey || '',
    };
  }

  static setCredentials(url: string, anonKey: string) {
    localStorage.setItem('grand_supabase_url', url.trim());
    localStorage.setItem('grand_supabase_anon_key', anonKey.trim());
  }

  static async testConnection(): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    if (!config.url || !config.anonKey) return { success: false, message: 'Supabase URL and publishable/anon key are required.' };
    try {
      const client = createClient(config.url, config.anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
      const { error } = await client.from('clients').select('id').limit(1);
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Supabase connection is live.' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Connection failed.' };
    }
  }
}
