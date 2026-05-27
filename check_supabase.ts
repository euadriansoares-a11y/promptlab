import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAndInsert() {
  const { data: prompts, error } = await supabase.from('prompts').select('id');
  if (error) {
    console.error("Error fetching:", error);
    return;
  }
  console.log("Current prompts count:", prompts.length);
}

checkAndInsert();
