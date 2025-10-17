import { NextResponse } from "next/server";

const SIM_API_ENDPOINT =
  "https://www.sim.ai/api/workflows/3905b4c9-e21a-4778-8152-bcb0b8e7dc91/execute";

type SimResponse =
  | string
  | {
      result?: unknown;
      output?: unknown;
      data?: unknown;
      response?: {
        data?: {
          rhyme?: unknown;
        };
        status?: number;
      };
    };

type SimOutput =
  | {
      text?: unknown;
      content?: Array<{ text?: unknown }>;
      rhyme?: unknown;
      ["just-rhyme"]?: unknown;
    }
  | string
  | null;

function extractText(value: SimOutput): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (typeof value.text === "string") return value.text;
  if (typeof value.rhyme === "string") return value.rhyme;
  const dashed = value["just-rhyme"];
  if (typeof dashed === "string") return dashed;
  if (typeof value.content === "string") return value.content;

  if (Array.isArray(value.content)) {
    for (const chunk of value.content) {
      if (chunk && typeof chunk.text === "string") {
        return chunk.text;
      }
    }
  }

  return undefined;
}

function extractRhyme(payload: SimResponse) {
  if (typeof payload === "string") {
    return payload;
  }

  const candidates = [
    payload?.response?.data?.rhyme,
    payload?.output,
    payload?.result,
    payload?.data,
    (payload as { outputs?: unknown })?.outputs,
    payload?.response?.data,
    payload?.response,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      return candidate;
    }

    if (Array.isArray(candidate)) {
      const first = candidate[0] as SimOutput | undefined;
      if (typeof first === "string") {
        return first;
      }
      const textFromArray = extractText(first ?? null);
      if (textFromArray) return textFromArray;
      continue;
    }

    if (candidate && typeof candidate === "object") {
      const objectCandidate = candidate as SimOutput & { rhyme?: unknown };

      if (
        "rhyme" in objectCandidate &&
        typeof objectCandidate.rhyme === "string"
      ) {
        return objectCandidate.rhyme;
      }

      if (
        "just-rhyme" in objectCandidate &&
        typeof objectCandidate["just-rhyme"] === "string"
      ) {
        return objectCandidate["just-rhyme"];
      }

      const textCandidate = extractText(objectCandidate);
      if (textCandidate) return textCandidate;
    }
  }

  return undefined;
}

export async function POST(request: Request) {
  const apiKey = process.env.SIM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Sim AI API key is not configured on the server." },
      { status: 500 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const prompt =
    body && typeof body === "object" && "text" in body
      ? (body as { text?: unknown }).text
      : undefined;

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing rhyme text." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(SIM_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        "just-rhyme": prompt,
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorPayload: unknown;
      try {
        errorPayload = responseText ? JSON.parse(responseText) : null;
      } catch {
        errorPayload = responseText || response.statusText;
      }

      console.error(
        "[Sim API] Request failed",
        response.status,
        errorPayload,
      );

      return NextResponse.json(
        {
          error: "Failed to fetch rhyme from Sim AI agent.",
          details: errorPayload,
        },
        { status: response.status },
      );
    }

    let data: SimResponse;

    try {
      data = responseText ? (JSON.parse(responseText) as SimResponse) : {};
    } catch {
      console.error("[Sim API] Invalid JSON response", responseText);
      return NextResponse.json(
        {
          error: "Received invalid JSON from Sim AI agent.",
          details: responseText,
        },
        { status: response.status },
      );
    }

    if (
      data &&
      typeof data === "object" &&
      "response" in data &&
      data.response &&
      typeof data.response === "object" &&
      "data" in data.response &&
      typeof data.response.data === "string"
    ) {
      try {
        data.response.data = JSON.parse(data.response.data);
      } catch (error) {
        console.error(
          "[Sim API] Failed to parse nested response data",
          data.response.data,
          error,
        );
      }
    }

    const rhyme = extractRhyme(data);

    if (!rhyme) {
      console.error("[Sim API] Missing rhyme in payload", data);
      return NextResponse.json(
        {
          error: "Unable to determine rhyme from Sim AI response.",
          details: data,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ rhyme });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unexpected error contacting Sim AI agent.",
        details:
          error instanceof Error ? error.message : "Unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
