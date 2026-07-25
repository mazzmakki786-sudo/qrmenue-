import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Helper to parse env file
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    const key = parts[0].trim();
    let val = parts.slice(1).join('=').trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  });
  return env;
}

// Load env variables from .env.local
const localEnv = loadEnv(path.resolve('.env.local'));
const supabaseUrl = localEnv.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = localEnv.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase URL or Service Role Key in env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanUser(email) {
  console.log(`🧹 Attempting to clean up user: ${email}...`);
  
  // 1. Get user details from auth.users
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('❌ Failed to list users:', listError.message);
    process.exit(1);
  }
  
  const targetUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  
  if (!targetUser) {
    console.log(`ℹ️ User ${email} does not exist. No DB cleanup required.`);
    return;
  }
  
  const userId = targetUser.id;
  console.log(`🔍 Found user ID: ${userId}`);
  
  // 2. Find and delete restaurants owned by this user
  const { data: restaurants, error: fetchErr } = await supabase
    .from('restaurants')
    .select('id, name, slug')
    .eq('owner_id', userId);
    
  if (fetchErr) {
    console.error('❌ Failed to fetch restaurants:', fetchErr.message);
  } else if (restaurants && restaurants.length > 0) {
    console.log(`🗑️ Deleting ${restaurants.length} restaurant(s) owned by user...`);
    for (const r of restaurants) {
      console.log(`  Deleting restaurant: ${r.name} (${r.slug})`);
      const { error: delRestErr } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', r.id);
      if (delRestErr) {
        console.error(`  ❌ Failed to delete restaurant ${r.id}:`, delRestErr.message);
      } else {
        console.log(`  ✅ Restaurant ${r.name} deleted successfully.`);
      }
    }
  } else {
    console.log('ℹ️ No restaurants found for this user.');
  }

  // 3. Delete the auth user
  const { error: deleteUserErr } = await supabase.auth.admin.deleteUser(userId);
  if (deleteUserErr) {
    console.error(`❌ Failed to delete auth user ${userId}:`, deleteUserErr.message);
  } else {
    console.log(`✅ Auth user ${email} deleted successfully.`);
  }
}

cleanUser('test_qa_agent@yopmail.com')
  .then(() => {
    console.log('✨ Cleanup complete.');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
  });
