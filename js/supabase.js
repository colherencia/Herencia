// Configuración de Supabase
const SUPABASE_URL = 'https://ozdhmcdnaipnvynakhbd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_T8OPbQbiNQruXeWdrTKB-w_ehPvO3XG';

// Cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
