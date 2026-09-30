import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_PROJECT_ID = 'dbddplawdicokffewuwz';
export const DEFAULT_SUPABASE_URL = 'https://dbddplawdicokffewuwz.supabase.co';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function isValidHttpUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  try {
    const parsed = new URL(urlString.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function sanitizeSupabaseUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== 'string') return DEFAULT_SUPABASE_URL;
  let clean = rawUrl.trim();
  if (
    !clean ||
    clean === 'undefined' ||
    clean === 'null' ||
    clean === 'https://YOUR_PROJECT.supabase.co' ||
    clean.includes('YOUR_PROJECT')
  ) {
    return DEFAULT_SUPABASE_URL;
  }

  // If user entered only project ref, e.g. "dbddplawdicokffewuwz"
  if (/^[a-z0-9_-]{12,50}$/i.test(clean)) {
    return `https://${clean}.supabase.co`;
  }

  // If user entered "dbddplawdicokffewuwz.supabase.co" without protocol
  if (clean.includes('.supabase.co') && !clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }

  // If missing protocol but looks like a host
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }

  // Remove trailing slashes
  clean = clean.replace(/\/+$/, '');

  // Validate using URL parser
  if (isValidHttpUrl(clean)) {
    return clean;
  }

  return DEFAULT_SUPABASE_URL;
}

// Memory cache of client
let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export class SupabaseService {
  static getProjectId(): string {
    const url = this.getConfig().url;
    try {
      const parsed = new URL(url);
      const hostParts = parsed.hostname.split('.');
      if (hostParts.length > 0 && hostParts[0]) {
        return hostParts[0];
      }
    } catch {
      // fallback
    }
    return DEFAULT_SUPABASE_PROJECT_ID;
  }

  static getConfig(): SupabaseConfig {
    const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
    const envKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim();

    const localUrl = localStorage.getItem('grand_supabase_url')?.trim();
    const localKey = localStorage.getItem('grand_supabase_anon_key')?.trim();

    const url = sanitizeSupabaseUrl(localUrl || envUrl || DEFAULT_SUPABASE_URL);
    const anonKey = (localKey || envKey || '').trim();

    // Auto-repair malformed local storage URL if needed
    if (localUrl && localUrl !== url) {
      try {
        localStorage.setItem('grand_supabase_url', url);
      } catch {
        // ignore
      }
    }

    return {
      url,
      anonKey,
    };
  }

  static setCredentials(url: string, anonKey: string) {
    const cleanUrl = sanitizeSupabaseUrl(url);
    const cleanKey = anonKey.trim();

    try {
      localStorage.setItem('grand_supabase_url', cleanUrl);
      localStorage.setItem('grand_supabase_anon_key', cleanKey);
    } catch {
      // ignore
    }

    // Invalidate client cache
    cachedClient = null;
    lastUrl = '';
    lastKey = '';

    // Dispatch event so all components react immediately
    window.dispatchEvent(new CustomEvent('grand-supabase-config-changed'));
  }

  static clearCredentials() {
    try {
      localStorage.removeItem('grand_supabase_url');
      localStorage.removeItem('grand_supabase_anon_key');
    } catch {
      // ignore
    }
    cachedClient = null;
    lastUrl = '';
    lastKey = '';
    window.dispatchEvent(new CustomEvent('grand-supabase-config-changed'));
  }

  static isConfigured(): boolean {
    const config = this.getConfig();
    const isKeyReal = Boolean(
      config.anonKey &&
      config.anonKey !== 'YOUR_SUPABASE_PUBLISHABLE_KEY' &&
      config.anonKey !== 'your-supabase-anon-key' &&
      config.anonKey !== 'undefined' &&
      config.anonKey !== 'null' &&
      config.anonKey.length > 20
    );
    return Boolean(config.url && isValidHttpUrl(config.url) && isKeyReal);
  }

  static getClient(): SupabaseClient | null {
    if (!this.isConfigured()) {
      return null;
    }

    const config = this.getConfig();
    if (!config.url || !config.anonKey || !isValidHttpUrl(config.url)) {
      return null;
    }

    if (cachedClient && lastUrl === config.url && lastKey === config.anonKey) {
      return cachedClient;
    }

    try {
      cachedClient = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      lastUrl = config.url;
      lastKey = config.anonKey;
      return cachedClient;
    } catch (err) {
      console.warn('Supabase client creation notice:', err);
      return null;
    }
  }

  static async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    const config = this.getConfig();
    if (!config.anonKey) {
      return {
        success: false,
        message: 'Supabase anon/publishable key is missing. Please paste your anon public key from the Supabase API settings.',
      };
    }

    if (!isValidHttpUrl(config.url)) {
      return {
        success: false,
        message: `Invalid Supabase URL: "${config.url}". Must be a valid HTTP or HTTPS URL like ${DEFAULT_SUPABASE_URL}`,
      };
    }

    let client: SupabaseClient | null = null;
    try {
      client = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (createErr) {
      return {
        success: false,
        message: `Failed to initialize client: ${createErr instanceof Error ? createErr.message : String(createErr)}`,
      };
    }

    if (!client) {
      return {
        success: false,
        message: 'Could not initialize Supabase client with the provided URL.',
      };
    }

    try {
      // Test querying clients table
      const { data, error } = await client.from('clients').select('id, name').limit(1);

      if (error) {
        // Check if table does not exist
        if (error.code === '42P01' || error.message.toLowerCase().includes('relation "clients" does not exist')) {
          return {
            success: false,
            message: 'Connected to Supabase, but database tables are not created yet! Run the supabase_schema.sql script in your SQL Editor.',
            details: error,
          };
        }
        return {
          success: false,
          message: `Database error: ${error.message} (code: ${error.code || 'unknown'})`,
          details: error,
        };
      }

      return {
        success: true,
        message: 'Supabase connection is LIVE and verified! Database tables are ready.',
        details: { count: data?.length || 0 },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed.',
      };
    }
  }
}

// Dynamic getter proxy so `supabase` always safely delegates or returns undefined
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = SupabaseService.getClient();
    if (!client) {
      return undefined;
    }
    const val = (client as any)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});
