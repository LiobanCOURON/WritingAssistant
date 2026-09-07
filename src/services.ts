import { APIConfig, AgentMessage, RAGChunk, Project } from './types';

// ==================== API CALLS ====================

export async function fetchModels(endpoint: string, apiKey: string): Promise<string[]> {
  try {
    const url = endpoint.replace(/\/$/, '') + '/models';
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.data && Array.isArray(data.data)) {
      return data.data.map((m: any) => m.id || m.name).filter(Boolean);
    }
    return [];
  } catch (e) {
    console.error('Failed to fetch models:', e);
    return [];
  }
}

async function callOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  temperature: number = 0.7,
  maxTokens: number = 1024,
  tools?: any[]
): Promise<any> {
  const url = endpoint.replace(/\/$/, '') + '/chat/completions';
  const body: any = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: false,
  };
  if (tools && tools.length > 0) {
    body.tools = tools;
    body.tool_choice = 'auto';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error ${res.status}: ${errText}`);
  }
  return res.json();
}

// ==================== INLINE SUGGESTION ====================

export async function getInlineSuggestion(
  config: APIConfig,
  documentContent: string,
  context: string
): Promise<string> {
  const messages = [
    {
      role: 'system',
      content: `Tu es un assistant de rédaction créative et scientifique. Tu proposes des continuations de texte fluides et naturelles.
Règles :
- Propose UN paragraphe cohérent (2-4 phrases)
- Adapte le style au texte existant (littéraire, scientifique, fiction, etc.)
- Ne répète pas ce qui est déjà écrit
- Sois concis mais riche en contenu
- Réponds UNIQUEMENT avec le texte suggéré, sans explication ni commentaire`,
    },
    {
      role: 'user',
      content: `Texte actuel (dernières lignes) :\n${documentContent.slice(-500)}\n\n${context ? `Contexte supplémentaire : ${context}\n\n` : ''}Propose la suite naturelle du texte :`,
    },
  ];

  try {
    const data = await callOpenAICompatible(
      config.inlineEndpoint,
      config.inlineApiKey,
      config.inlineModel,
      messages,
      0.8,
      200
    );
    return data.choices?.[0]?.message?.content?.trim() || '';
  } catch (e) {
    console.error('Inline suggestion error:', e);
    return '';
  }
}

// ==================== AGENT SYSTEM PROMPT & TOOLS ====================

const AGENT_SYSTEM_PROMPT = `Tu es PlumeAI Agent, un assistant de rédaction avancé spécialisé dans la création littéraire, scientifique et fictionnelle.

## Tes capacités :
- Analyse approfondie de textes (structure, style, thèmes, ton)
- Réécriture et amélioration stylistique
- Correction grammaticale et orthographique
- Expansion créative de concepts
- Résumé intelligent
- Traduction multilingue
- Recherche contextuelle dans les documents du projet
- Génération d'outlines et de structures narratives
- Conseils éditoriaux professionnels

## Tes principes :
- Tu t'adaptes au style et au ton de l'auteur
- Tu proposes des améliorations concrètes et actionnables
- Tu respectes la vision créative de l'auteur
- Tu es précis dans tes analyses
- Tu utilises les outils disponibles quand c'est pertinent

## Quand utiliser les outils :
- summarize : quand on te demande un résumé
- expand : quand on demande de développer/enrichir
- rewrite : quand on demande une réécriture
- correct : quand on demande une correction
- translate : quand on demande une traduction
- analyze : quand on demande une analyse
- search_context : quand tu as besoin d'informations des autres documents du projet
- generate_outline : quand on demande une structure/plan
- improve_style : quand on demande d'améliorer le style

Sois proactif dans l'utilisation des outils quand c'est pertinent.`;

export const AGENT_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'summarize',
      description: 'Résume le texte ou le document actuel de manière concise et structurée',
      parameters: {
        type: 'object',
        properties: {
          length: { type: 'string', enum: ['short', 'medium', 'detailed'], description: 'Longueur du résumé souhaité' },
          focus: { type: 'string', description: 'Aspect sur lequel se concentrer (optionnel)' },
        },
        required: ['length'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'expand',
      description: 'Développe et enrichit le texte en ajoutant des détails, descriptions, ou arguments',
      parameters: {
        type: 'object',
        properties: {
          direction: { type: 'string', description: 'Direction de l\'expansion (détails, exemples, arguments, descriptions...)' },
          target_length: { type: 'string', enum: ['slightly', 'moderately', 'significantly'], description: 'Augmentation de longueur souhaitée' },
        },
        required: ['direction'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'rewrite',
      description: 'Réécrit le texte dans un style différent ou avec un ton spécifique',
      parameters: {
        type: 'object',
        properties: {
          style: { type: 'string', description: 'Style cible (littéraire, académique, journalistique, poétique, conversationnel...)' },
          tone: { type: 'string', description: 'Ton souhaité (formel, informel, dramatique, humoristique...)' },
          preserve_meaning: { type: 'boolean', description: 'Conserver le sens original' },
        },
        required: ['style'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'correct',
      description: 'Corrige les erreurs grammaticales, orthographiques, syntaxiques et de ponctuation',
      parameters: {
        type: 'object',
        properties: {
          level: { type: 'string', enum: ['basic', 'advanced', 'stylistic'], description: 'Niveau de correction (basique, avancé incluant style, ou stylistique complet)' },
          show_changes: { type: 'boolean', description: 'Montrer les modifications effectuées' },
        },
        required: ['level'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'translate',
      description: 'Traduit le texte dans une langue cible',
      parameters: {
        type: 'object',
        properties: {
          target_language: { type: 'string', description: 'Langue cible (français, anglais, espagnol, allemand, japonais, chinois...)' },
          preserve_style: { type: 'boolean', description: 'Tenter de préserver le style littéraire' },
        },
        required: ['target_language'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'analyze',
      description: 'Analyse le texte en profondeur : structure, thèmes, style, personnages, progression narrative',
      parameters: {
        type: 'object',
        properties: {
          aspects: {
            type: 'array',
            items: { type: 'string', enum: ['structure', 'style', 'themes', 'characters', 'pacing', 'tone', 'coherence'] },
            description: 'Aspects à analyser',
          },
        },
        required: ['aspects'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'search_context',
      description: 'Recherche des informations pertinentes dans les autres documents du projet (RAG)',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Ce que tu cherches dans les documents' },
          max_results: { type: 'number', description: 'Nombre maximum de résultats' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'generate_outline',
      description: 'Génère un plan/outline structuré pour un texte, chapitre ou section',
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Sujet ou thème principal' },
          structure_type: { type: 'string', enum: ['narrative', 'academic', 'essay', 'report', 'story_arc'], description: 'Type de structure' },
          depth: { type: 'number', description: 'Niveau de détail (1-3)' },
        },
        required: ['topic', 'structure_type'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'improve_style',
      description: 'Améliore le style d\'écriture : vocabulaire, fluidité, rythme, figures de style',
      parameters: {
        type: 'object',
        properties: {
          focus: { type: 'string', enum: ['vocabulary', 'flow', 'rhythm', 'imagery', 'all'], description: 'Aspect stylistique à améliorer' },
          intensity: { type: 'string', enum: ['subtle', 'moderate', 'dramatic'], description: 'Intensité des modifications' },
        },
        required: ['focus'],
      },
    },
  },
];

export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface AgentResponse {
  content: string;
  toolCalls?: ToolCall[];
}

export async function agentChat(
  config: APIConfig,
  messages: AgentMessage[],
  ragContext: string,
  projectContext: string
): Promise<AgentResponse> {
  const systemContent = [
    AGENT_SYSTEM_PROMPT,
    projectContext ? `\n## Document actuel :\n${projectContext}` : '',
    ragContext ? `\n## Contexte des documents du projet (RAG) :\n${ragContext}` : '',
    `\n## Date actuelle : ${new Date().toLocaleDateString('fr-FR')}`,
  ].filter(Boolean).join('\n');

  const chatMessages = [
    { role: 'system', content: systemContent },
    ...messages.slice(-20).map(m => ({
      role: m.role === 'tool' ? 'assistant' as const : m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  try {
    const data = await callOpenAICompatible(
      config.agentEndpoint,
      config.agentApiKey,
      config.agentModel,
      chatMessages,
      0.7,
      2048,
      AGENT_TOOLS
    );

    const choice = data.choices?.[0];
    if (!choice) return { content: 'Erreur: pas de réponse' };

    const message = choice.message;
    const toolCalls: ToolCall[] = [];

    if (message.tool_calls) {
      for (const tc of message.tool_calls) {
        toolCalls.push({
          name: tc.function.name,
          arguments: JSON.parse(tc.function.arguments || '{}'),
        });
      }
    }

    return {
      content: message.content || '',
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    };
  } catch (e) {
    console.error('Agent chat error:', e);
    throw e;
  }
}

// ==================== TOOL EXECUTION ====================

export function executeTool(toolCall: ToolCall, documents: { title: string; content: string }[]): string {
  const { name, arguments: args } = toolCall;

  switch (name) {
    case 'summarize':
      return `[Outil: Résumé ${args.length}] En cours de traitement par l'IA avec le document actuel.`;
    case 'expand':
      return `[Outil: Expansion direction="${args.direction}" target="${args.target_length}"] En cours de traitement.`;
    case 'rewrite':
      return `[Outil: Réécriture style="${args.style}" tone="${args.tone || 'neutre'}"] En cours de traitement.`;
    case 'correct':
      return `[Outil: Correction niveau="${args.level}"] En cours de traitement.`;
    case 'translate':
      return `[Outil: Traduction vers "${args.target_language}"] En cours de traitement.`;
    case 'analyze':
      return `[Outil: Analyse aspects=${JSON.stringify(args.aspects)}] En cours de traitement.`;
    case 'search_context':
      const results = searchInDocuments(documents, args.query, args.max_results || 3);
      return results.length > 0
        ? `Résultats trouvés :\n${results.map(r => `--- ${r.title} ---\n${r.snippet}`).join('\n\n')}`
        : 'Aucun résultat trouvé dans les documents du projet.';
    case 'generate_outline':
      return `[Outil: Plan topic="${args.topic}" type="${args.structure_type}" depth=${args.depth}] En cours de génération.`;
    case 'improve_style':
      return `[Outil: Amélioration style focus="${args.focus}" intensity="${args.intensity}"] En cours de traitement.`;
    default:
      return `Outil inconnu: ${name}`;
  }
}

function searchInDocuments(documents: { title: string; content: string }[], query: string, maxResults: number): { title: string; snippet: string }[] {
  const queryWords = query.toLowerCase().split(/\s+/);
  const scored = documents.map(doc => {
    const contentLower = doc.content.toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      const matches = contentLower.split(word).length - 1;
      score += matches;
    }
    // Find snippet around first match
    const firstIdx = contentLower.indexOf(queryWords[0] || '');
    const start = Math.max(0, firstIdx - 100);
    const end = Math.min(doc.content.length, firstIdx + 200);
    const snippet = doc.content.substring(start, end).trim();
    return { title: doc.title, snippet: (start > 0 ? '...' : '') + snippet + (end < doc.content.length ? '...' : ''), score };
  });
  return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, maxResults);
}

// ==================== RAG ====================

export function buildRAGContext(chunks: RAGChunk[], query: string): string {
  if (chunks.length === 0) return '';
  const queryWords = query.toLowerCase().split(/\s+/);

  const scored = chunks.map(chunk => {
    const contentLower = chunk.content.toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      score += (contentLower.split(word).length - 1);
    }
    return { ...chunk, score };
  });

  const topChunks = scored.filter(c => c.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);

  if (topChunks.length === 0) {
    return chunks.slice(0, 3).map(c => `[${c.folderName}/${c.chapterTitle}]\n${c.content.substring(0, 300)}...`).join('\n\n---\n\n');
  }

  return topChunks.map(c => `[${c.folderName}/${c.chapterTitle}]\n${c.content.substring(0, 500)}`).join('\n\n---\n\n');
}

export function chunkText(text: string, maxChunkSize: number = 500): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > maxChunkSize && current.length > 0) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += (current ? ' ' : '') + sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// ==================== FILE IMPORT ====================

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export async function extractTextFromPDF(file: File): Promise<string> {
  // Basic PDF text extraction - for production use pdf.js
  const text = await readFileAsText(file);
  // Simple extraction: remove binary content, keep readable text
  const readable = text.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
  return readable || `[Contenu PDF de: ${file.name}]`;
}

export async function extractTextFromDOCX(file: File): Promise<string> {
  // Basic extraction - for production use mammoth.js
  const text = await readFileAsText(file);
  return text || `[Contenu DOCX de: ${file.name}]`;
}

export async function importFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'txt':
    case 'md':
      return readFileAsText(file);
    case 'pdf':
      return extractTextFromPDF(file);
    case 'docx':
    case 'doc':
      return extractTextFromDOCX(file);
    default:
      return readFileAsText(file);
  }
}
