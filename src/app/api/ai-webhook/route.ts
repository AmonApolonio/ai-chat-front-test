import { NextRequest, NextResponse } from 'next/server';

interface ProductItem {
  title: string;
  product_link: string;
  source: string;
  icon: string;
  price: number;
  photo_url: string;
}

interface LookDescription {
  item1?: string;
  item2?: string;
  item3?: string;
  item4?: string;
  item5?: string;
}

interface WebhookRequest {
  clienteId: number | string;
  chatId: number | string;
  question?: string;
  answers?: string[];
  remaining?: number;
  descricaoLooks?: LookDescription;
  items1?: ProductItem[];
  items2?: ProductItem[];
  items3?: ProductItem[];
  items4?: ProductItem[];
  items5?: ProductItem[];
}

interface AIResponse {
  question?: string;
  answers?: string[];
  remaining?: number;
  descricaoLooks?: LookDescription;
  items1?: ProductItem[];
  items2?: ProductItem[];
  items3?: ProductItem[];
  items4?: ProductItem[];
  items5?: ProductItem[];
  timestamp: Date;
}

// Extend global to include our AI responses store
declare global {
  var aiResponses: Map<string, AIResponse> | undefined;
}

export async function POST(request: NextRequest) {
  try {
    const data: WebhookRequest = await request.json();
    
    console.log('Webhook received:', data);

    // Validate required fields
    if (!data.clienteId || !data.chatId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes: clienteId ou chatId' },
        { status: 400 }
      );
    }

    // Check if it's a regular Q&A response or a Look response
    const isLookResponse = data.descricaoLooks || data.remaining !== undefined;
    
    if (!isLookResponse && !data.question) {
      return NextResponse.json(
        { error: 'Campo "question" ausente para resposta de perguntas e respostas' },
        { status: 400 }
      );
    }

    // For now, we'll just log the response and return success
    // In a real implementation, you might want to:
    // 1. Store this in a database
    // 2. Send via WebSocket to the connected client
    // 3. Use Server-Sent Events
    // 4. Store in memory/cache for polling
    
    // We'll use a simple approach with a global store for this demo
    // In production, you'd want to use Redis, database, or WebSocket
    
    const responseData: Record<string, unknown> = {
      clienteId: data.clienteId,
      chatId: data.chatId
    };

    // Add fields based on response type
    if (isLookResponse) {
      responseData.remaining = data.remaining;
      responseData.descricaoLooks = data.descricaoLooks;
      responseData.items1 = data.items1;
      responseData.items2 = data.items2;
      responseData.items3 = data.items3;
      responseData.items4 = data.items4;
      responseData.items5 = data.items5;
    } else {
      responseData.question = data.question;
      responseData.answers = data.answers || [];
    }
    
    const response = {
      success: true,
      message: isLookResponse ? 'Resposta de look recebida' : 'Resposta de IA recebida',
      data: responseData
    };

    // Store the response for the chat polling mechanism
    // This is a simple in-memory store - in production use Redis or similar
    global.aiResponses = global.aiResponses || new Map();
    
    const storedResponse: AIResponse = {
      timestamp: new Date()
    };

    if (isLookResponse) {
      storedResponse.remaining = data.remaining;
      storedResponse.descricaoLooks = data.descricaoLooks;
      storedResponse.items1 = data.items1;
      storedResponse.items2 = data.items2;
      storedResponse.items3 = data.items3;
      storedResponse.items4 = data.items4;
      storedResponse.items5 = data.items5;
    } else {
      storedResponse.question = data.question;
      storedResponse.answers = data.answers || [];
    }

    global.aiResponses.set(data.chatId.toString(), storedResponse);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Endpoint do Webhook de IA está ativo',
    timestamp: new Date().toISOString()
  });
}