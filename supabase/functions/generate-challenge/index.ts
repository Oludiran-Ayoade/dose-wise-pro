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

    const systemPrompt = `You are an expert problem creator for Loki AI (a coding challenge platform). Your task is to generate realistic, fair coding challenges that LLMs will solve.

CRITICAL REQUIREMENTS:
1. The challenge must be FAIR - solvable using only the README
2. Include real-world context (not pure abstract logic)
3. Test case distribution: 10-15% should be straightforward (basic happy path), 80-85% should be challenging (edge cases, complex scenarios)
4. Total should be 15-18 test cases
5. All information needed to pass tests must be in the description
6. Use realistic domains: healthcare, finance, e-commerce, logistics, etc.

README FORMAT - Follow this EXACT structure:
# [Challenge Title]

## Problem Description
[Clear, concise description of the problem. Include real-world context. Be specific about requirements and constraints. Expected behavior of the solution.]

## Input
[Describe input parameters:
- Parameter types and names
- Valid input ranges
- Any constraints or assumptions]

## Output
[Describe expected output:
- Return type
- Format of the output
- Any specific requirements]

## Available Libraries
You have access to the following pre-installed crates:
- serde (1.0.215) - Serialization framework
- serde_json (1.0.132) - JSON serialization
- jsonpath_lib (0.3.0) - JSONPath implementation
- bincode (1.3.3) - Binary serialization
- uuid (1.11.0) - UUID generation and parsing
- rand (0.8.5) - Random number generation
- anyhow (1.0.93) - Flexible error handling
- thiserror (1.0.69) - Error derive macros
- tokio (1.41.1) - Asynchronous runtime
- futures (0.3.31) - Asynchronous programming
- async-trait (0.1.83) - Async traits
- rayon (1.10.0) - Data parallelism library
- parking_lot (0.12.3) - Synchronization primitives
- dashmap (6.1.0) - Concurrent hash map
- crossbeam-channel (0.5.13) - Multi-producer multi-consumer channels
- flume (0.11.1) - Fast multi-producer channel
- bytes (1.8.0) - Byte buffer utilities
- regex (1.11.1) - Regular expressions
- itertools (0.13.0) - Extra iterator adaptors
- hashbrown (0.15.2) - Fast hash map implementation
- indexmap (2.6.0) - Hash map with consistent ordering
- chrono (0.4.38) - Date and time library

## Testing Framework
This challenge uses Rust's built-in test framework. Tests are in tests/solution_test.rs and use the #[test] attribute.

## Examples
### Example 1
**Input:**
\`\`\`
[example input]
\`\`\`

**Output:**
\`\`\`
[expected output]
\`\`\`

**Explanation:** [Why this output is correct]

### Example 2
**Input:**
\`\`\`
[another example]
\`\`\`

**Output:**
\`\`\`
[expected output]
\`\`\`

**Explanation:** [Reasoning]

## Notes
- [Important clarifications]
- [Time/space complexity requirements if applicable]
- [Edge cases that should be handled]

BASE CODE REQUIREMENTS:
- Function signatures with pub visibility
- Use statements for needed crates
- Struct/enum definitions if needed
- Use todo!() for unimplemented parts
- NO comments (put clarifications in README)

SOLUTION REQUIREMENTS:
- Complete working implementation
- Must pass ALL tests
- Use pub visibility for tested functions
- Clean, readable code

TEST REQUIREMENTS:
- Use use solution::function_name; to import
- Each test with #[test] attribute
- 2-3 easy tests (10-15% pass rate for AI)
- 12-15 hard tests (80-85% challenge rate)
- Cover edge cases, boundaries, error conditions
- Clear test names describing what's tested

RESPONSE FORMAT:
{
  "title": "Clear Title",
  "readme": "Complete README following format above",
  "baseCode": "Rust scaffold with pub functions and todo!()",
  "solution": "Complete working Rust solution with pub functions",
  "testCases": [
    {"name": "test_basic_case", "code": "full test code", "difficulty": "easy"},
    {"name": "test_edge_case", "code": "full test code", "difficulty": "hard"}
  ]
}

Generate a NEW realistic coding challenge now. Return ONLY valid JSON, no markdown.`;

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
    
    // Ensure readme field exists (backward compatibility with old format)
    if (!challenge.readme && challenge.description) {
      challenge.readme = challenge.description;
    }
    
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
