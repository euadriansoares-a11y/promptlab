import fs from 'fs';

const rawTexto = fs.readFileSync('./prompt.txt', 'utf8');

const lines = rawTexto.split('\n');
let currentCategory = '';
let currentCard: any = {};
const cards: any[] = [];

const gradientMap: any = {
  'Diagnóstico': 'from-[#2d1b69] to-[#0a0a0a]',
  'Roteiros': 'from-[#4a1060] to-[#8b0057]',
  'Feed': 'from-[#0d4a4a] to-[#0a0a0a]',
  'Stories': 'from-[#3d1a00] to-[#0a0a0a]',
  'Copywriting': 'from-[#0d1b4a] to-[#2d1b69]',
  'YouTube': 'from-[#4a0d0d] to-[#0a0a0a]',
  'LinkedIn': 'from-[#0d2a4a] to-[#0a0a0a]',
  'Vendas': 'from-[#0d3a1a] to-[#0a0a0a]',
  'Estratégia': 'from-[#1a1a2e] to-[#0a0a0a]',
  'Imagens IA': 'from-[#3a2a00] to-[#0a0a0a]',
  'Mentalidade': 'from-[#1e0a3c] to-[#0a1a3c]',
  'Agentes IA': 'from-[#003a3a] to-[#0a0a0a]',
  'Relatórios': 'from-[#1a3a3a] to-[#0a0a0a]'
};

let inPrompt = false;
let currentPrompt = '';

for (const line of lines) {
  if (line.startsWith('### CATEGORIA:')) {
    currentCategory = line.replace('### CATEGORIA:', '').trim();
    if (currentCategory === 'COPYWRITING') currentCategory = 'Copywriting';
    if (currentCategory === 'FEED') currentCategory = 'Feed';
    if (currentCategory === 'STORIES') currentCategory = 'Stories';
    if (currentCategory === 'ROTEIROS') currentCategory = 'Roteiros';
    if (currentCategory === 'VENDAS') currentCategory = 'Vendas';
    if (currentCategory === 'ESTRATÉGIA') currentCategory = 'Estratégia';
    if (currentCategory === 'YOUTUBE') currentCategory = 'YouTube';
    if (currentCategory === 'LINKEDIN') currentCategory = 'LinkedIn';
    if (currentCategory === 'AGENTES IA') currentCategory = 'Agentes IA';
    if (currentCategory === 'MENTALIDADE') currentCategory = 'Mentalidade';
    if (currentCategory === 'IMAGENS IA') currentCategory = 'Imagens IA';
    if (currentCategory === 'RELATÓRIOS') currentCategory = 'Relatórios';
  } else if (line.startsWith('**Card ')) {
    if (Object.keys(currentCard).length > 0 && currentPrompt.trim().length > 0) {
      currentCard.prompt_text = currentPrompt.trim();
      cards.push(currentCard);
    }
    currentCard = { category: currentCategory, username: 'eu.adrian_g.s', avatar: 'AS' };
    currentPrompt = '';
  } else if (line.startsWith('- Título:')) {
    currentCard.post_title = line.replace('- Título:', '').trim();
    currentCard.title = currentCard.post_title.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  } else if (line.startsWith('- Subtítulo:')) {
    currentCard.post_subtitle = line.replace('- Subtítulo:', '').trim().replace('⚡ ', '').trim();
  } else if (line.startsWith('- Descrição:')) {
    currentCard.description = line.replace('- Descrição:', '').trim();
  } else if (line.startsWith('- Ferramenta:')) {
    currentCard.tool = line.replace('- Ferramenta:', '').trim();
  } else if (line.startsWith('\`\`\`')) {
    inPrompt = !inPrompt;
  } else if (inPrompt) {
    currentPrompt += line + '\n';
  }
}

if (Object.keys(currentCard).length > 0 && currentPrompt.trim().length > 0) {
  currentCard.prompt_text = currentPrompt.trim();
  cards.push(currentCard);
}

let sql = '-- Inserir os novos prompts\n';
sql += 'INSERT INTO public.prompts (title, description, category, prompt_text, username, avatar, post_title, post_subtitle, gradient) VALUES\n';

const values = cards.map(c => {
  const t = c.title ? c.title.replace(/'/g, "''") : '';
  const d = c.description ? c.description.replace(/'/g, "''") : '';
  const cat = c.category;
  const pt = c.prompt_text ? c.prompt_text.replace(/'/g, "''") : '';
  const u = 'eu.adrian_g.s';
  const a = 'AS'; 
  const ptitle = c.post_title ? c.post_title.replace(/'/g, "''") : '';
  const psub = (c.post_subtitle + ' (⚡ ' + c.tool + ')').replace(/'/g, "''");
  const g = gradientMap[cat] || 'from-[#1a1a2e] to-[#0a0a0a]';
  return `('${t}', '${d}', '${cat}', '${pt}', '${u}', '${a}', '${ptitle}', '${psub}', '${g}')`;
});

sql += values.join(',\n') + ';\n';
fs.writeFileSync('new_prompts.sql', sql);

console.log("Gerou " + cards.length + " cards");

// Generate data.ts addition
let tsInsert = 'export const NEW_PROMPTS = [\n';
const tsValues = cards.map((c, i) => {
  return `  {
    id: ${13 + i},
    title: \`${c.title ? c.title.replace(/`/g, "\\`") : ''}\`,
    desc: \`${c.description ? c.description.replace(/`/g, "\\`") : ''}\`,
    category: "${c.category}",
    text: \`${c.prompt_text ? c.prompt_text.replace(/`/g, "\\`") : ''}\`,
    username: "${c.username}",
    avatar: "${c.avatar}",
    postTitle: \`${c.post_title ? c.post_title.replace(/`/g, "\\`") : ''}\`,
    postSubtitle: \`${c.post_subtitle} (⚡ ${c.tool})\`,
    gradient: "${gradientMap[c.category] || 'from-[#1a1a2e] to-[#0a0a0a]'}"
  }`;
});
tsInsert += tsValues.join(',\n') + '\n];\n';
fs.writeFileSync('new_data.ts', tsInsert);
console.log("Arquivo ts gerado");
