import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { PROMPTS_DATA } from './src/data.ts';

dotenv.config();

let url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
url = url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

const supabase = createClient(
  url,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const formattedItems = PROMPTS_DATA.map((c: any) => ({
    title: c.title,
    description: c.desc,
    category: c.category,
    prompt_text: c.text,
    username: c.username,
    avatar: c.avatar,
    post_title: c.postTitle,
    post_subtitle: c.postSubtitle,
    gradient: c.gradient
  }));
  
  const { error } = await supabase.from('prompts').insert(formattedItems);
  if (error) {
    console.error("Insert error:", error);
  } else {
    console.log("Successfully inserted", formattedItems.length, "items.");
  }
}

run();
