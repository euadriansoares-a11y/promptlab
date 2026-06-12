import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

let url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log("Raw SUPABASE_URL from env:", JSON.stringify(url));
console.log("Is serviceRoleKey configured? Length:", serviceRoleKey.length);

// Clean the URL just like client side does
let cleanedUrl = url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '').trim();
if (cleanedUrl && !cleanedUrl.startsWith('http')) {
  cleanedUrl = `https://${cleanedUrl}`;
}
console.log("Cleaned SUPABASE_URL being used:", cleanedUrl);

const supabase = createClient(
  cleanedUrl,
  serviceRoleKey
);

async function checkAndInsert() {
  console.log("Checking Supabase connection and tables with cleaned URL...");
  
  // 1. Check prompts
  const { data: prompts, error: promptsErr } = await supabase.from('prompts').select('id').limit(1);
  if (promptsErr) {
    console.error("❌ Error fetching prompts:", promptsErr.message);
  } else {
    console.log("✅ Prompts table exists. Limit 1 result:", prompts);
  }

  // 2. Check profiles
  const { data: profiles, error: profilesErr } = await supabase.from('profiles').select('*').limit(1);
  if (profilesErr) {
    console.error("❌ Error fetching profiles:", profilesErr.message);
  } else {
    console.log("✅ Profiles table exists. Limit 1 result:", profiles);
  }

  // 3. Check perfis
  const { data: perfis, error: perfisErr } = await supabase.from('perfis').select('*').limit(1);
  if (perfisErr) {
    console.error("❌ Error fetching perfis:", perfisErr.message);
  } else {
    console.log("✅ Perfis table exists. Limit 1 result:", perfis);
  }

  // 4. Check compras
  const { data: compras, error: comprasErr } = await supabase.from('compras').select('*').limit(1);
  if (comprasErr) {
    console.error("❌ Error fetching compras:", comprasErr.message);
  } else {
    console.log("✅ Compras table exists. Limit 1 result:", compras);
  }
}

checkAndInsert();


