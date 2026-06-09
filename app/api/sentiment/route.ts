import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_API_TOKEN);

async function performSentimentAnalysis(text: string) {
  const result = await hf.textClassification({
    model: 'nlptown/bert-base-multilingual-uncased-sentiment',
    inputs: text,
  });

  // Extract the best prediction
  const predictions = Array.isArray(result) ? result : [result];
  const best = predictions.reduce((a, b) => (a.score > b.score ? a : b));

  // Map 1-5 stars to SentimentLabel enum: POSITIVE, NEGATIVE, NEUTRAL
  // 1-2: NEGATIVE, 3: NEUTRAL, 4-5: POSITIVE
  const stars = parseInt(best.label);
  let sentimentLabel: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' = 'NEUTRAL';
  if (stars <= 2) sentimentLabel = 'NEGATIVE';
  else if (stars >= 4) sentimentLabel = 'POSITIVE';

  return {
    stars,
    confidence: best.score,
    label: best.label,
    sentimentLabel,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const complaintId = searchParams.get('complaintId');
    const text = searchParams.get('text');

    if (complaintId) {
      const complaint = await prisma.complaint.findUnique({
        where: { id: complaintId },
      });

      if (!complaint) {
        return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
      }

      const analysis = await performSentimentAnalysis(complaint.rawText);

      await prisma.complaint.update({
        where: { id: complaintId },
        data: { sentimentLabel: analysis.sentimentLabel },
      });

      return NextResponse.json({ success: true, ...analysis });
    }

    if (text) {
      const analysis = await performSentimentAnalysis(text);
      return NextResponse.json(analysis);
    }

    return NextResponse.json({ error: 'complaintId or text required' }, { status: 400 });
  } catch (error: any) {
    console.error('Sentiment analysis failed:', error.message);
    return NextResponse.json(
      { error: 'Analysis failed', detail: error.message }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const analysis = await performSentimentAnalysis(text);
    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error('Sentiment analysis failed:', error.message);
    return NextResponse.json(
      { error: 'Analysis failed', detail: error.message }, 
      { status: 500 }
    );
  }
}