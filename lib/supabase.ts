import { createClient } from '@supabase/supabase-js';

// Credentials provided by user
const supabaseUrl = "https://eddyxfajdhykhisectya.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZHl4ZmFqZGh5a2hpc2VjdHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTQ1NDYsImV4cCI6MjA3OTc5MDU0Nn0.sq16yIStzGNj7_xTjYd9p2chUESxY10InCRJI7RDTO8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);