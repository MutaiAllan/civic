// Replace this with your Python/NLP API endpoint when ready.
// Expected response shape is documented below.
export interface SentimentResponse {
  complaint_id: string;
  sentiment_label: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  sentiment_score: number;        // 0.0 – 1.0 confidence
  category: string;
  department: string;
  keywords: string[];
}

export async function analyzeSentiment(
  complaintId: string,
  text: string
): Promise<SentimentResponse> {
  // ─── MOCK ─── swap the block below for your real NLP endpoint:
  // const res = await fetch(process.env.NLP_API_URL!, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ id: complaintId, text }),
  // });
  // return res.json();

  const labels: SentimentResponse["sentiment_label"][] = ["POSITIVE", "NEGATIVE", "NEUTRAL"];
  const label = labels[Math.floor(Math.random() * labels.length)];
  return {
    complaint_id: complaintId,
    sentiment_label: label,
    sentiment_score: parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)),
    category: "Infrastructure",
    department: "Roads & Transport",
    keywords: ["road", "pothole", "repair"],
  };
}
