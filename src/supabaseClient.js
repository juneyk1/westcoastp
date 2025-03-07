import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://sszqcnbxqznblwpseoxd.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzenFjbmJ4cXpuYmx3cHNlb3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MTgyNjgsImV4cCI6MjA1NjI5NDI2OH0.j5b6cZ_dnHUFZMSzvC_rSNl3HsC613T5OavAvgQfNJQ"; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
