import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'partner' | 'client';
  company: string | null;
  title: string | null;
  phone: string | null;
  created_at: string;
};

export type Article = {
  id: string;
  title: string;
  category: string | null;
  opening_line: string | null;
  full_content: string | null;
  publisher: string | null;
  published: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type MemberFeedback = {
  id: string;
  email: string | null;
  message: string | null;
  created_at: string;
};

export type MemberRequest = {
  id: string;
  email: string | null;
  request_type: string | null;
  message: string | null;
  created_at: string;
};
