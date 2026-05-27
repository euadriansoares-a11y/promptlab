import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { NEW_PROMPTS } from './new_data.ts';

dotenv.config();

let url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
url = url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

const supabase = createClient(
  url,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const { data: existing, error: errTest } = await supabase.from('prompts').select('id');
  if (errTest) {
    console.error("Error checking:", errTest);
    return;
  }
  
  console.log("Current prompts in DB:", existing.length);
  
  const formattedItems = NEW_PROMPTS.map((c: any) => ({
    title: c.title,
    description: c.desc,
    category: c.category,
    prompt_text: c.text,
    username: c.username,
    avatar: c.avatar,
    post_title: c.postTitle,
    post_subtitle: c.postSubtitle.replace(/ \(⚡ .*?\)/, ''), // remove format if needed, but it's part of postSubtitle in db
    gradient: c.gradient
  }));
  
  // Re-append the (⚡ tool) correctly
  NEW_PROMPTS.forEach((c: any, i) => {
    formattedItems[i].post_subtitle = c.postSubtitle;
  });

  const { data, error } = await supabase.from('prompts').insert(formattedItems);
  
  if (error) {
    console.error("Error inserting:", error);
  } else {
    console.log("Successfully inserted elements.");
  }
  
  const { data: existing2 } = await supabase.from('prompts').select('id');
  console.log("New count in DB:", existing2?.length);
}

run();
