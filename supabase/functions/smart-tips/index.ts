import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { expenses, balances, currency } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const summary = {
      totalSpent: expenses.reduce((s: number, e: any) => s + Number(e.amount), 0),
      byCategory: expenses.reduce((acc: any, e: any) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
        return acc;
      }, {}),
      byAccount: expenses.reduce((acc: any, e: any) => {
        acc[e.account_type] = (acc[e.account_type] || 0) + Number(e.amount);
        return acc;
      }, {}),
      count: expenses.length,
      balances,
    };

    const systemPrompt = `You are a warm, witty personal finance coach. Analyze the user's spending and reply with EXACTLY 3 short, punchy, personalized tips. Each tip must be 1-2 sentences max. Be specific (mention categories, amounts, percentages). Use the currency symbol "${currency}". Sound like a thoughtful friend, not a robot. No preamble, no numbering, no markdown — just three lines separated by "|||".`;

    const userPrompt = `Spending data (last entries):\n${JSON.stringify(summary, null, 2)}\n\nGive 3 tips separated by |||`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const tips = raw.split("|||").map((s: string) => s.trim()).filter(Boolean).slice(0, 3);

    return new Response(JSON.stringify({ tips }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("smart-tips error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
