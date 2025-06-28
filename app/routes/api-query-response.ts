// app/routes/api/query-response.ts
import { prisma } from "~/prisma.server";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const guid = url.searchParams.get("guid");
  if (!guid) {
    // For privacy, return empty array if no guid is provided
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  }
  const all = await prisma.queryResponse.findMany({
    where: { guid },
    orderBy: { createdAt: "desc" },
  });
  return new Response(JSON.stringify(all), {
    headers: { "Content-Type": "application/json" },
  });
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const { messages, guid } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0 || !guid) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Call OpenAI API
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 100,
      }),
    });

    const openaiData = await openaiRes.json();
    if (openaiData.error) {
      console.error("OpenAI API Error:", openaiData.error);
      return new Response(JSON.stringify({ error: openaiData.error.message }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    const aiResponse = openaiData.choices?.[0]?.message?.content ?? "No response";
    const lastUserMessage = [...messages].reverse().find(m => m.role === "user")?.content ?? "";

    // Save to DB
    const saved = await prisma.queryResponse.create({
      data: { prompt: lastUserMessage, response: aiResponse, guid },
    });

    return new Response(JSON.stringify(saved), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("API Route Error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
};