// supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jefygwdannsixjbazajm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZnlnd2Rhbm5zaXhqYmF6YWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDc1MzQsImV4cCI6MjA1OTQyMzUzNH0.6Ujh5AnJG6ajmrINyKR7qwiO7XJPkUK8isYGvPqLn04'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
