import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    console.log("Generating coding challenge...");

    const systemPrompt = `You are an expert problem creator for Loki AI (a coding challenge platform). Your task is to generate realistic, fair coding challenges similar to real-world GitHub issues or Jira tickets.

CRITICAL REQUIREMENTS:
1. The challenge must be FAIR - solvable using only the README
2. Include real-world context (not pure abstract logic)
3. Test case distribution: 10-15% should be straightforward, 80-85% should be challenging
4. README should be concise like a real task, not a tutorial
5. Include proper error handling and edge cases
6. Use realistic function/method names and parameters

CHALLENGE STRUCTURE:
{
  "title": "Brief, clear title",
  "description": "Concise problem description with real-world context. Keep under 300 words. Write like a GitHub issue.",
  "baseCode": "Scaffold code with function signatures and todo() placeholders. Use Rust syntax.",
  "solution": "Complete working solution in Rust",
  "testCases": [
    {
      "name": "test_simple_case",
      "code": "Rust test code",
      "difficulty": "easy"
    },
    {
      "name": "test_edge_case",
      "code": "Rust test code", 
      "difficulty": "hard"
    }
  ]
}

IMPORTANT:
- Make 2-3 tests "easy" difficulty (basic happy path)
- Make 12-15 tests "hard" difficulty (edge cases, complex scenarios)
- Total should be 15-18 test cases
- Tests should be comprehensive but fair
- All information needed to pass tests must be in the description
- Use realistic domains: healthcare, finance, e-commerce, logistics, etc.
- Avoid overexplaining - trust the developer to reason

Generate a NEW coding challenge now. Return ONLY valid JSON, no markdown formatting.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate a new coding challenge with realistic context and proper test distribution." }
        ],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to generate challenge" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let challengeText = data.choices[0].message.content;
    
    // Remove markdown code blocks if present
    challengeText = challengeText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const challenge = JSON.parse(challengeText);
    
    console.log("Challenge generated successfully");

    return new Response(JSON.stringify(challenge), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-challenge function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
