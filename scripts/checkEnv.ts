// scripts/checkEnv.ts

process.env.VITE_LANGFUSE_PUBLIC_KEY = process.env.VITE_LANGFUSE_PUBLIC_KEY || 'pk-lf-57c6e2ec-8603-44cf-b030-ccddcef1f1f3d';
process.env.VITE_LANGFUSE_BASE_URL = process.env.VITE_LANGFUSE_BASE_URL || 'https://app.langfuse.com';
process.env.LANGFUSE_SECRET_KEY = process.env.LANGFUSE_SECRET_KEY || 'sk-lf-c1872960-86af-4899-b275-b7de8d536794';
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mchyxyuaegsbrwodengr.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jaHl4eXVhZWdzYnJ3b2RlbmdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NjU1MzQsImV4cCI6MjA2MjE0MTUzNH0.cXMj4nlE7oExTRetNT2x4ktq6yoCuwy0dVDziq5C-co';
process.env.LANGFUSE_PUBLIC_KEY = process.env.LANGFUSE_PUBLIC_KEY || 'pk-lf-57c6e2ec-8603-44cf-b030-ccddcef1f1f3d';
process.env.VITE_API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

console.log('🔧 Vite Config - Environment Check:', {
  mode: process.env.NODE_ENV || 'development',
  hasPublicKey: !!process.env.LANGFUSE_PUBLIC_KEY,
  hasSecretKey: !!process.env.LANGFUSE_SECRET_KEY,
  hasBaseUrl: !!process.env.VITE_API_BASE_URL
});
