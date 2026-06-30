import type { IncomingMessage, ServerResponse } from "node:http";

export interface VercelRequest extends IncomingMessage {
  body?: unknown;
}

export interface VercelResponse extends ServerResponse {
  status?: (code: number) => VercelResponse;
  json?: (data: unknown) => VercelResponse;
}

interface PitchRequestPayload {
  fullname?: string;
  username?: string;
  platform?: string;
  followers?: number;
  engagement_rate?: number;
  brand_affinity?: string[];
  top_hashtags?: string[];
}

function sendJson(res: VercelResponse, code: number, data: unknown) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    res.status(code);
    res.json(data);
  } else {
    res.statusCode = code;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  }
}

async function getBody(req: VercelRequest): Promise<PitchRequestPayload | null> {
  if (req.body !== undefined) {
    if (typeof req.body === "string") {
      try {
        return JSON.parse(req.body) as PitchRequestPayload;
      } catch {
        return null;
      }
    }
    return req.body as PitchRequestPayload;
  }
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw) as PitchRequestPayload);
      } catch {
        resolve(null);
      }
    });
    req.on("error", () => resolve(null));
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    sendJson(res, 503, { error: "NVIDIA_API_KEY is not configured on the server." });
    return;
  }

  try {
    const payload = await getBody(req);
    if (!payload || typeof payload !== "object") {
      sendJson(res, 400, { error: "Invalid request body" });
      return;
    }

    const details = [
      `Full Name: ${payload.fullname || "Unknown"}`,
      `Username: @${payload.username || "unknown"}`,
      `Platform: ${payload.platform || "Unknown"}`,
      `Followers: ${payload.followers !== undefined ? payload.followers : "N/A"}`,
      `Engagement Rate: ${payload.engagement_rate !== undefined ? `${(payload.engagement_rate * 100).toFixed(2)}%` : "N/A"}`
    ];
    const hasBrands = Boolean(payload.brand_affinity && payload.brand_affinity.length > 0);
    if (hasBrands) {
      details.push(`Brand Affinities: ${payload.brand_affinity!.join(", ")}`);
    }
    if (payload.top_hashtags && payload.top_hashtags.length > 0) {
      details.push(`Top Hashtags: ${payload.top_hashtags.join(", ")}`);
    }

    const brandInstruction = hasBrands
      ? 'Use ONLY the facts listed above. Do not mention any brand, product, partnership, sponsor, location, or named entity that is not explicitly listed in "Brand Affinities" above. Do not invent statistics, brand names, product lines, or any other specific claim not given to you.'
      : "Use ONLY the facts listed above. If no brand affinities are listed, do not name any specific brands at all — describe the creator's appeal in general terms only (audience size, engagement, content category). Do not invent statistics, brand names, product lines, or any other specific claim not given to you. Do not mention or imply any brand relationship at all.";

    const prompt = `Write one tight paragraph (2–3 sentences, no bullet points, no markdown) pitching why a brand might want to work with this creator, grounded only in the following real data:\n${details.join("\n")}\n\n${brandInstruction}`;

    const nvidiaRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-ultra-550b-a55b",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 220,
        temperature: 0.7,
        chat_template_kwargs: { enable_thinking: false },
      }),
    });

    if (!nvidiaRes.ok) {
      if (nvidiaRes.status === 429) {
        sendJson(res, 429, { error: "Rate limit exceeded. Please try again in a moment." });
        return;
      }
      sendJson(res, 502, { error: `NVIDIA API request failed (${nvidiaRes.status})` });
      return;
    }

    const data = await nvidiaRes.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      sendJson(res, 502, { error: "Received empty pitch response from AI model." });
      return;
    }

    sendJson(res, 200, { pitch: text });
  } catch {
    sendJson(res, 500, { error: "An unexpected error occurred while generating the pitch." });
  }
}
