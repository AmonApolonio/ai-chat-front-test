import { NextRequest, NextResponse } from 'next/server';

interface SendMessageRequest {
  message: string;
  chatId: string;
  filesUrl?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { message, chatId, filesUrl }: SendMessageRequest = await request.json();

    if (!message || !chatId) {
      return NextResponse.json(
        { error: 'Mensagem e chatId são obrigatórios' },
        { status: 400 }
      );
    }

    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    const username = process.env.N8N_USERNAME;
    const password = process.env.N8N_PASSWORD;
    const clienteName = process.env.CLIENTE_NOME;
    const clienteId = process.env.CLIENTE_ID;

    if (!n8nUrl || !username || !password || !clienteName || !clienteId) {
      console.error('Missing environment variables');
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      );
    }

    // Create Basic Auth header
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');

    const payload: Record<string, unknown> = {
      "cliente_nome": clienteName,
      "cliente_id": parseInt(clienteId),
      "chat_id": parseInt(chatId),
      "mensagem": message
    };

    // Add files-url if provided
    if (filesUrl && filesUrl.length > 0) {
      payload["files-url"] = filesUrl;
    }

    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('N8N response error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Falha ao enviar mensagem para o serviço de IA' },
        { status: response.status }
      );
    }

    const result = await response.text();
    console.log('N8N response:', result);

    return NextResponse.json({ 
      success: true, 
      message: 'Mensagem enviada para o serviço de IA',
      chatId 
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}