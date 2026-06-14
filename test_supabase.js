const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vneeugjoqtdlldtylddt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZWV1Z2pvcXRkbGxkdHlsZGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTQ3MDcsImV4cCI6MjA5NTk3MDcwN30.jb4E8XThylj_X9-LOOIXgV9yneVg644mWSMH_n8IoeQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    console.log("Testing Supabase Insert without version...");
    const { data, error } = await supabase
        .from('user_app_data')
        .upsert({
            id: 'test_user_id',
            accounts: [],
            sales: [],
            buyer_search: [],
            keuangan: [],
            wishlist: [],
            jurnal: [],
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error("Supabase Error:", error);
    } else {
        console.log("Success:", data);
    }
}

test();
