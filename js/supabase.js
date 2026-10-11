const SUPABASE_URL = "https://ozdhmcdnaipnvynakhbd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZGhtY2RuYWlwbnZ5bmFraGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0OTk5MDMsImV4cCI6MjEwNzA3NTkwM30.WoPDibieW6nwdKV205_2RnxWNE_b-j0rk7g0pYpj7_E";

(function() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = function() {
        if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: {
                    persistSession: true,
                    detectSessionInUrl: true,
                    autoRefreshToken: true,
                },
            });
            console.log('Supabase client inicializado correctamente');
        } else {
            console.error('No se pudo inicializar el cliente de Supabase');
        }
    };
    script.onerror = function() {
        console.error('Error al cargar el SDK de Supabase');
    };
    document.head.appendChild(script);
})();
