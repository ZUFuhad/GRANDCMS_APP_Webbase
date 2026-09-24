import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://dbddplawdicokffewuwz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_cxT_7DYRjNyi5YWZq3n5zQ_LVlsK7br';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

class SupabaseServiceEngine {
  private client: SupabaseClient | null = null;
  private url: string = DEFAULT_SUPABASE_URL;
  private anonKey: string = DEFAULT_SUPABASE_ANON_KEY;

  constructor() {
    this.init();
  }

  public init() {
    // 1. Try env variables
    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

    // 2. Try localStorage config
    const storedUrl = localStorage.getItem('grand_cms_supabase_url');
    const storedKey = localStorage.getItem('grand_cms_supabase_anon_key');

    const rawUrl = envUrl || storedUrl || DEFAULT_SUPABASE_URL;
    this.url = (rawUrl && typeof rawUrl === 'string' && rawUrl.trim().startsWith('http')) ? rawUrl.trim() : DEFAULT_SUPABASE_URL;
    
    const rawKey = envKey || storedKey || DEFAULT_SUPABASE_ANON_KEY;
    this.anonKey = (rawKey && typeof rawKey === 'string') ? rawKey.trim() : DEFAULT_SUPABASE_ANON_KEY;

    if (this.url && this.anonKey && this.url.startsWith('http')) {
      try {
        this.client = createClient(this.url, this.anonKey);
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  public setCredentials(url: string, anonKey: string) {
    const cleanUrl = url && typeof url === 'string' && url.trim().startsWith('http') ? url.trim() : DEFAULT_SUPABASE_URL;
    this.url = cleanUrl;
    this.anonKey = anonKey ? anonKey.trim() : '';

    localStorage.setItem('grand_cms_supabase_url', this.url);
    localStorage.setItem('grand_cms_supabase_anon_key', this.anonKey);

    if (this.url && this.anonKey && this.url.startsWith('http')) {
      try {
        this.client = createClient(this.url, this.anonKey);
      } catch (err) {
        console.error('Failed to re-initialize Supabase client:', err);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  public getConfig(): SupabaseConfig {
    return {
      url: this.url,
      anonKey: this.anonKey,
      isConnected: !!(this.client && this.anonKey),
    };
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }

  public async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    if (!this.anonKey) {
      return {
        success: false,
        message: 'Supabase anon / public key is required. Please paste your anon key from Project Settings > API.',
      };
    }

    if (!this.client) {
      this.init();
    }

    if (!this.client) {
      return {
        success: false,
        message: 'Could not initialize Supabase client. Check URL and Anon Key format.',
      };
    }

    try {
      // Test querying the clients table or system health
      const { data, error } = await this.client.from('clients').select('id').limit(1);

      if (error) {
        // Table might not be created yet in SQL editor
        if (error.code === '42P01') {
          return {
            success: true,
            message: 'Connected to Supabase! Note: The tables are not created yet. Please run schema.sql in Supabase SQL Editor.',
            details: { tablesMissing: true },
          };
        }
        return {
          success: false,
          message: `Supabase Error (${error.code || 'API'}): ${error.message}`,
          details: error,
        };
      }

      return {
        success: true,
        message: 'Successfully connected to Supabase database! Tables are accessible.',
        details: { rowCount: data?.length || 0 },
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Network error while contacting Supabase.',
      };
    }
  }
}

export const SupabaseService = new SupabaseServiceEngine();
