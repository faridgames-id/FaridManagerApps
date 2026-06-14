const { createClient } = require('@supabase/supabase-js');
const url = 'https://vneeugjoqtdlldtylddt.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZWV1Z2pvcXRkbGxkdHlsZGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTQ3MDcsImV4cCI6MjA5NTk3MDcwN30.jb4E8XThylj_X9-LOOIXgV9yneVg644mWSMH_n8IoeQ';
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('user_app_data').select('*').limit(1);
  console.log('Data:', data);
  console.log('Error:', error);
}
test();
