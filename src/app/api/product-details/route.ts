import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { pageToken } = await request.json();

    if (!pageToken) {
      return NextResponse.json(
        { error: 'O token da página é obrigatório' },
        { status: 400 }
      );
    }

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave SerpAPI não configurada' },
        { status: 500 }
      );
    }

    // Construct the SerpAPI URL
    const serpApiUrl = new URL('https://serpapi.com/search');
    serpApiUrl.searchParams.append('engine', 'google_immersive_product');
    serpApiUrl.searchParams.append('page_token', pageToken);
    serpApiUrl.searchParams.append('api_key', apiKey);

    // Make the request to SerpAPI
    const response = await fetch(serpApiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Falha na requisição SerpAPI: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar detalhes do produto:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar detalhes do produto' },
      { status: 500 }
    );
  }
}