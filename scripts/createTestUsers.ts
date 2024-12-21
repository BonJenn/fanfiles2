// scripts/createTestUsers.ts
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Debug environment variables
console.log('Environment variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '[PRESENT]' : '[MISSING]');

// Check for required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Required environment variables are missing.');
  console.error('Please ensure you have set:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Test the connection with a simple query instead
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Connection test failed:', error.message);
      process.exit(1);
    }
    console.log('Supabase connection successful');
  } catch (err) {
    console.error('Connection test error:', err);
    process.exit(1);
  }
}

async function createTestUsers() {
  try {
    await testConnection();

    // Create 20 users
    for (let i = 1; i <= 20; i++) {
      const email = `user${i}@example.com`;
      const password = 'password123';

      console.log(`Attempting to create user ${i}: ${email}`);

      // Create user with admin API
      const { data: { user }, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (userError) {
        console.error(`Error creating user ${email}:`, userError);
        continue;
      }

      if (!user) {
        console.error(`No user created for ${email}`);
        continue;
      }

      const userId = user.id;
      console.log(`Created user with ID: ${userId}`);

      // Create or update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: email,
          name: `Creator ${i}`,
          bio: `Test creator account #${i}`,
          avatar_url: `https://api.dicebear.com/7.x/avatars/svg?seed=${i}`,
          subscription_price: Math.floor(Math.random() * 20 + 5) * 100
        });

      if (profileError) {
        console.error(`Error updating profile for ${email}:`, profileError);
        continue;
      }

      // Create 5 posts for each user
      for (let j = 1; j <= 5; j++) {
        console.log(`Creating post ${j} for user ${email}`);
        
        const { error: postError } = await supabase
          .from('posts')
          .insert({
            title: `Test Post ${j} by Creator ${i}`,
            description: `This is test post #${j} from creator ${i}`,
            url: `https://picsum.photos/seed/${i}${j}/800/600`,
            creator_id: userId,
            type: Math.random() > 0.2 ? 'image' : 'video',
            is_public: Math.random() > 0.3,
            price: Math.floor(Math.random() * 15 + 1) * 100,
            created_at: new Date().toISOString()
          });

        if (postError) {
          console.error(`Error creating post ${j} for ${email}:`, postError);
        }
      }

      console.log(`Completed setup for user ${email}`);
    }

    console.log('Finished creating test users and posts');
  } catch (error) {
    console.error('Error in createTestUsers:', error);
  }
}

createTestUsers();