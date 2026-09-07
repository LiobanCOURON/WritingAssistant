import { APIConfig, AgentMessage, RAGChunk } from './types';

// ========================
// SYSTEM PROMPTS
// ========================

const WRITING_AGENT_SYSTEM = `Tu es PlumeAI, un assistant de rédaction littéraire et scientifique expert. Tu aides les auteurs à écrire, réviser, structurer et enrichir leurs textes.

## Tes capacités :
- Rédaction créative (romans, nouvelles, poésie, scripts)
- Rédaction scientifique (articles, thèses, rapports)
- Analyse stylistique et structurelle
- Correction grammaticale et orthographique
- Développement d'idées et d'arguments
- Cohérence narrative et continuité
- Recherche contextuelle dans les documents du projet

## Ton style :
- Tu es précis, créatif et adaptatif
- Tu respectes le ton et le style de l'auteur
- Tu proposes des améliorations concrètes
- Tu expliques tes choix quand c'est pertinent
- Tu utilises les outils à ta disposition pour enrichir ton analyse

## Règles importantes :
- Ne réécris JAMAIS un texte sans qu'on te le demande explicitement
- Quand tu corriges, montre les changements
- Respecte la voix de l'auteur
- Sois concis dans tes explications, détaillé dans tes propositions
- Utilise le contexte RAG fourni pour maintenir la cohérence`;

const INLINE_SYSTEM = `Tu es un assistant de complétion de texte. Continue le texte de manière naturelle et cohérente.
Règles :
- Continue dans le même style et ton
- Propose la suite logique du texte
- Reste concis (1-3 phrases max)
- Ne répète pas ce qui existe déjà
- Réponds UNIQUEMENT avec le texte de continuation, sans explication`;

// ========================
// API CALLS
// ========================

export async function fetchModels(endpoint: string, apiKey: string): Promise<string[]> {
  try {
    const url = `${endpoint.replace(/\/$/, '')}/models`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const models = data.data || data.models || [];
    return models.map((m: any) => m.id || m.name || m).filter(Boolean);
  } catch (e) {
    console.error('Failed to fetch models:', e);
    return [];
  }
}

export async function getInlineSuggestion(
  config: APIConfig,
  content: string,
  _cursorContext: string
): Promise<string> {
  if (!config.inlineEndpoint || !config.inlineModel) return '';

  try {
    const url = `${config.inlineEndpoint.replace(/\/$/, '')}/chat/completions`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.inlineApiKey) headers['Authorization'] = `Bearer ${config.inlineApiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.inlineModel,
        messages: [
          { role: 'system', content: INLINE_SYSTEM },
          { role: 'user', content: `Texte actuel :\n${content.slice(-500)}\n\nContinue naturellement :` },
        ],
        max_tokens: 150,
        temperature: 0.8,
        stream: false,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  } catch (e) {
    console.error('Inline suggestion error:', e);
    return '';
  }
}

export interface AgentResponse {
  content: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

export async function agentChat(
  config: APIConfig,
  messages: AgentMessage[],
  ragContext: string,
  projectContext: string
): Promise<AgentResponse> {
  if (!config.agentEndpoint || !config.agentModel) {
    return { content: '⚠️ Configurez l\'endpoint Agent dans les paramètres.' };
  }

  try {
    const url = `${config.agentEndpoint.replace(/\/$/, '')}/chat/completions`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.agentApiKey) headers['Authorization'] = `Bearer ${config.agentApiKey}`;

    const systemMsg = `${WRITING_AGENT_SYSTEM}

## Contexte du projet :
${projectContext || 'Aucun document actif'}

## Documents indexés (RAG) :
${ragContext || 'Aucun contexte disponible'}

## Outils disponibles :
- summarize: Résumer le document ou un extrait
- expand: Développer et enrichir un texte
- rewrite: Réécrire dans un style différent
- correct: Corriger grammaire et orthographe
- translate: Traduire vers une langue cible
- analyze: Analyser la structure, le style, les thèmes
- search: Rechercher dans les documents du projet
- outline: Générer un plan/structure
- brainstorm: Générer des idées`;

    const chatMessages = [
      { role: 'system', content: systemMsg },
      ...messages
        .filter(m => m.role !== 'tool')
        .map(m => ({ role: m.role, content: m.content })),
    ];

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.agentModel,
        messages: chatMessages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';

    return { content };
  } catch (e) {
    return { content: `❌ Erreur: ${e}` };
  }
}

// ========================
// TOOLS
// ========================

export function executeTool(
  toolCall: ToolCall,
  documents: { title: string; content: string }[]
): string {
  const { name, arguments: args } = toolCall;
  const allContent = documents.map(d => `## ${d.title}\n${d.content}`).join('\n\n');

  switch (name) {
    case 'summarize':
      return `[Outil: Résumé] Analyse de ${documents.length} document(s), ${allContent.length} caractères total.`;
    case 'expand':
      return `[Outil: Expansion] Texte cible identifié. Prêt pour développement.`;
    case 'rewrite':
      return `[Outil: Réécriture] Style demandé: ${args.style || 'littéraire'}`;
    case 'correct':
      return `[Outil: Correction] Analyse grammaticale en cours sur ${allContent.length} caractères.`;
    case 'translate':
      return `[Outil: Traduction] Langue cible: ${args.target || 'anglais'}`;
    case 'analyze':
      const words = allContent.split(/\s+/).length;
      const paragraphs = allContent.split(/\n\n+/).length;
      return `[Outil: Analyse] ${words} mots, ${paragraphs} paragraphes, ${documents.length} documents.`;
    case 'search':
      const query = args.query || '';
      const matches = allContent
        .split('\n')
        .filter(line => line.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10);
      return `[Outil: Recherche] "${query}" → ${matches.length} résultat(s):\n${matches.join('\n')}`;
    case 'outline':
      return `[Outil: Plan] Génération de structure pour le document actif.`;
    case 'brainstorm':
      return `[Outil: Brainstorm] Génération d'idées basée sur le contexte.`;
    default:
      return `[Outil inconnu: ${name}]`;
  }
}

// ========================
// RAG
// ========================

export function searchChunks(
  chunks: RAGChunk[],
  query: string,
  topK: number = 5,
  projectId?: string
): RAGChunk[] {
  const filtered = projectId ? chunks.filter(c => c.projectId === projectId) : chunks;
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

  const scored = filtered.map(chunk => {
    const contentLower = chunk.content.toLowerCase();
    let score = 0;

    // Exact match
    if (contentLower.includes(queryLower)) score += 10;

    // Word matches
    for (const word of queryWords) {
      if (contentLower.includes(word)) score += 2;
    }

    // Bonus for longer relevant chunks
    if (score > 0) score += Math.min(chunk.content.length / 1000, 3);

    return { ...chunk, score };
  });

  return scored
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// ========================
// SLASH COMMANDS
// ========================

export async function executeSlashCommand(
  apiConfig: APIConfig,
  action: string,
  content: string,
  instruction: string,
  notesContext: string
): Promise<string> {
  const systemPrompts: Record<string, string> = {
    develop: `Tu es un expert en rédaction. Développe le texte selon l'instruction de l'utilisateur. Ajoute des détails, enrichis les descriptions, approfondis les idées. Maintiens le style et le ton original. Réponds UNIQUEMENT avec le texte développé.`,
    summarize: `Tu es un expert en synthèse. Résume le texte de manière concise tout en conservant les idées principales. Réponds UNIQUEMENT avec le résumé.`,
    correct: `Tu es un correcteur expert. Corrige toutes les fautes de grammaire, orthographe, ponctuation et syntaxe. Améliore la clarté si nécessaire. Réponds UNIQUEMENT avec le texte corrigé.`,
    rewrite: `Tu es un expert en réécriture. Réécris le texte selon l'instruction de l'utilisateur en changeant le style, le ton ou la structure. Réponds UNIQUEMENT avec le texte réécrit.`,
    analyze: `Tu es un analyste littéraire. Analyse le style, la structure, les thèmes et les techniques du texte. Fournis une analyse détaillée et constructive.`,
    brainstorm: `Tu es un expert en créativité. Génère des idées, des pistes de développement, des angles d'approche pour continuer ou enrichir le texte selon l'instruction.`,
    outline: `Tu es un expert en structuration. Crée un plan détaillé pour développer le texte selon l'instruction. Organise les idées de manière logique et progressive.`,
    translate: `Tu es un traducteur expert. Traduis le texte selon l'instruction (langue cible précisée). Maintiens le style et le ton original. Réponds UNIQUEMENT avec la traduction.`,
    character: `Tu es un expert en création de personnages. Crée un personnage détaillé selon l'instruction : nom, apparence, personnalité, background, motivations, etc.`,
    place: `Tu es un expert en description de lieux. Décris un lieu de manière immersive selon l'instruction : atmosphère, détails sensoriels, histoire, etc.`,
  };

  const systemPrompt = systemPrompts[action] || systemPrompts.develop;
  const contextParts = [
    notesContext ? `## Contexte du projet (Notes):\n${notesContext}` : '',
    `## Texte actuel:\n${content}`,
    instruction ? `## Instruction:\n${instruction}` : '',
  ].filter(Boolean).join('\n\n');

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: contextParts },
  ];

  const url = `${apiConfig.agentEndpoint.replace(/\/$/, '')}/chat/completions`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiConfig.agentApiKey) headers['Authorization'] = `Bearer ${apiConfig.agentApiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: apiConfig.agentModel,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
