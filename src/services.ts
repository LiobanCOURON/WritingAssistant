import { APIConfig, RAGChunk, AgentMessage } from './types';

// Fetch available models from /models endpoint
export async function fetchModels(endpoint: string, apiKey: string): Promise<string[]> {
  try {
    const url = `${endpoint.replace(/\/$/, '')}/models`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.data && Array.isArray(data.data)) {
      return data.data.map((m: any) => m.id || m.name).filter(Boolean);
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return [];
  }
}

// Inline suggestion - completion
export async function getInlineSuggestion(
  config: APIConfig,
  text: string,
  cursorContext: string
): Promise<string> {
  try {
    const url = `${config.inlineEndpoint.replace(/\/$/, '')}/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.inlineApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.inlineModel,
        messages: [
          {
            role: 'system',
            content: 'You are a writing assistant. Complete the text naturally and seamlessly. Only output the continuation text, nothing else. No explanations, no quotes.'
          },
          {
            role: 'user',
            content: `Continue this text naturally (max 2-3 sentences):\n\n${text}`
          }
        ],
        max_tokens: 150,
        temperature: 0.8,
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Inline suggestion failed:', error);
    return '';
  }
}

// Agent chat with tools
export async function agentChat(
  config: APIConfig,
  messages: AgentMessage[],
  ragContext: string,
  projectContext: string
): Promise<{ content: string; toolCalls?: ToolCall[] }> {
  const tools = [
    {
      type: 'function' as const,
      function: {
        name: 'summarize',
        description: 'Summarize the given text or document',
        parameters: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Text to summarize' },
          },
          required: ['text'],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'expand',
        description: 'Expand and elaborate on the given text',
        parameters: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Text to expand' },
            direction: { type: 'string', description: 'Direction for expansion' },
          },
          required: ['text'],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'rewrite',
        description: 'Rewrite text with different style or tone',
        parameters: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Text to rewrite' },
            style: { type: 'string', description: 'Target style (formal, casual, academic, literary, etc.)' },
          },
          required: ['text', 'style'],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'correct',
        description: 'Correct grammar, spelling, and style',
        parameters: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Text to correct' },
          },
          required: ['text'],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'search_context',
        description: 'Search through project documents for relevant information',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
          },
          required: ['query'],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'analyze',
        description: 'Analyze text for structure, themes, characters, plot, etc.',
        parameters: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Text to analyze' },
            aspect: { type: 'string', description: 'Aspect to analyze (structure, themes, characters, style, etc.)' },
          },
          required: ['text'],
        },
      },
    },
  ];

  try {
    const systemPrompt = `You are an advanced writing assistant agent. You help users with creative writing, scientific publications, novels, and any type of text.

You have access to tools that you can use to help the user. Always be helpful, creative, and precise.

${ragContext ? `\n\nRelevant context from project documents:\n${ragContext}` : ''}
${projectContext ? `\n\nCurrent project context:\n${projectContext}` : ''}`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    const url = `${config.agentEndpoint.replace(/\/$/, '')}/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.agentApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.agentModel,
        messages: apiMessages,
        tools,
        tool_choice: 'auto',
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const choice = data.choices?.[0]?.message;

    if (choice?.tool_calls) {
      return {
        content: choice.content || '',
        toolCalls: choice.tool_calls.map((tc: any) => ({
          id: tc.id,
          name: tc.function.name,
          arguments: JSON.parse(tc.function.arguments),
        })),
      };
    }

    return { content: choice?.content || '' };
  } catch (error) {
    console.error('Agent chat failed:', error);
    return { content: 'Erreur lors de la communication avec l\'agent.' };
  }
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

// Execute tool locally
export function executeTool(toolCall: ToolCall, documents: { title: string; content: string }[]): string {
  const { name, arguments: args } = toolCall;

  switch (name) {
    case 'summarize':
      return `[Résumé demandé pour: "${args.text?.substring(0, 100)}..."]`;
    case 'expand':
      return `[Expansion demandée avec direction: "${args.direction || 'générale'}"]`;
    case 'rewrite':
      return `[Réécriture demandée en style: "${args.style}"]`;
    case 'correct':
      return `[Correction demandée]`;
    case 'search_context': {
      const query = args.query?.toLowerCase() || '';
      const results = documents
        .filter(d => d.content.toLowerCase().includes(query) || d.title.toLowerCase().includes(query))
        .map(d => `--- ${d.title} ---\n${d.content.substring(0, 500)}`)
        .join('\n\n');
      return results || 'Aucun résultat trouvé.';
    }
    case 'analyze':
      return `[Analyse demandée sur l'aspect: "${args.aspect || 'général'}"]`;
    default:
      return `Outil inconnu: ${name}`;
  }
}

// Simple RAG - text chunking and similarity search
export function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Keep overlap
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 5));
      currentChunk = overlapWords.join(' ') + ' ' + sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

// Simple keyword-based search (no embedding model needed)
export function searchChunks(query: string, chunks: RAGChunk[], topK: number = 5): RAGChunk[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  const scored = chunks.map(chunk => {
    const content = chunk.content.toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      const matches = content.split(word).length - 1;
      score += matches;
    }
    return { chunk, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.chunk);
}

export function buildRAGContext(chunks: RAGChunk[]): string {
  return chunks.map(c => `[${c.documentTitle}]: ${c.content}`).join('\n\n');
}
