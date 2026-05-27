import fs from 'fs';
import { NEW_PROMPTS } from './new_data.ts';

const dataFile = fs.readFileSync('src/data.ts', 'utf8');

const itemsString = NEW_PROMPTS.map((c: any) => {
  return `  {
    id: ${c.id},
    title: \`${c.title ? c.title.replace(/`/g, "\\`") : ''}\`,
    desc: \`${c.desc ? c.desc.replace(/`/g, "\\`") : ''}\`,
    category: "${c.category}",
    text: \`${c.text ? c.text.replace(/`/g, "\\`") : ''}\`,
    username: "${c.username}",
    avatar: "${c.avatar}",
    postTitle: \`${c.postTitle ? c.postTitle.replace(/`/g, "\\`") : ''}\`,
    postSubtitle: \`${c.postSubtitle}\`,
    gradient: "${c.gradient}"
  }`;
}).join(',\n');

let new_data = dataFile.replace(
  '  }\n];\n\nexport const CATEGORIES',
  '  },\n' + itemsString + '\n];\n\nexport const CATEGORIES'
);

const categories = Array.from(new Set([
  "Todos", "Diagnóstico", "Roteiros", "Feed", "Stories", "Vendas",
  ...NEW_PROMPTS.map((p: any) => p.category)
]));

new_data = new_data.replace(/export const CATEGORIES = \[.*?\];/s, `export const CATEGORIES = [${categories.map(c => `"${c}"`).join(', ')}];`);

fs.writeFileSync('src/data.ts', new_data);
console.log('done');
