// Supabase Configuration
// Niche diye gaye URL aur KEY ko apne Supabase Dashboard (Settings -> API) se replace karein
const SUPABASE_URL = '[https://your-project-id.supabase.co](https://your-project-id.supabase.co)';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
