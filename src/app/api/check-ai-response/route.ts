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

interface AIResponse {
  question?: string;
  answers?: string[];
  remaining?: number;
  descricao_looks?: LookDescription;
  items1?: ProductItem[];
  items2?: ProductItem[];
  items3?: ProductItem[];
  items4?: ProductItem[];
  items5?: ProductItem[];
  timestamp: Date;
}

declare global {
  var aiResponses: Map<string, AIResponse> | undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json(
        { error: 'O parâmetro chatId é obrigatório' },
        { status: 400 }
      );
    }

    // Initialize global store if it doesn't exist
    if (!global.aiResponses) {
      global.aiResponses = new Map();
    }

    // Check if there's a response for this chat ID
    const response = global.aiResponses.get(chatId);
    
    if (response) {
      // Remove the response after fetching (consume once)
      global.aiResponses.delete(chatId);
      
      return NextResponse.json({
        success: true,
        hasResponse: true,
        data: response
      });
    }

    return NextResponse.json({
      success: true,
      hasResponse: false,
      data: null
    });

  } catch (error) {
    console.error('Error checking AI response:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}