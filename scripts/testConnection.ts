const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

console.log('Testing Supabase connection...');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
// Only show first few characters of the key
console.log('Key (first 10 chars):', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) + '...');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) throw error;
    console.log('Connection successful!');
    console.log('Test query result:', data);
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

test();