import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';
import { CIVIC_DOCS } from '@/lib/chatbot-docs';

const hf = new HfInference(process.env.HF_API_TOKEN);

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    // Convert our message format to OpenAI/HF chat format
    // and include the system prompt with context
    const chatMessages = [
      { 
        role: "system", 
        content: `You are the CAES Assistant, a helpful AI guide for a civic complaint portal. 
                  Use the following context to answer the user's question. 
                  If the answer is not in the context, be polite and say you don't know, then suggest contacting support.
                  Keep responses concise (max 3 sentences).
                  
                  CONTEXT:
                  ${CIVIC_DOCS}` 
      },
      ...messages.map((m: any) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.text
      }))
    ];

    const response = await hf.chatCompletion({
      model: "meta-llama/Llama-3.2-1B-Instruct",
      messages: chatMessages,
      max_tokens: 150,
      temperature: 0.5,
    });



    const botResponse = response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({ text: botResponse.trim() });

  } catch (error: any) {
    console.error('Chat API error:', error.message);
    return NextResponse.json(
      { error: 'Chat failed', detail: error.message }, 
      { status: 500 }
    );
  }
}

