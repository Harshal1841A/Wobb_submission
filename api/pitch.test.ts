import { describe, it, expect, vi, beforeEach } from "vitest";
import handler, { type VercelRequest, type VercelResponse } from "./pitch";
import { EventEmitter } from "node:events";

function createMockReqRes(method = "POST", body?: unknown) {
  const req = new EventEmitter() as unknown as VercelRequest;
  req.method = method;
  req.body = body;

  let statusCode = 200;
  let responseData: unknown = null;

  const res = {
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (data: unknown) => {
      responseData = data;
      return res;
    },
  } as unknown as VercelResponse;

  return {
    req,
    res,
    getStatus: () => statusCode,
    getData: () => responseData,
  };
}

describe("api/pitch handler verification (Layer 2)", () => {
  beforeEach(() => {
    process.env.NVIDIA_API_KEY = "test-api-key";
    vi.restoreAllMocks();
  });

  it("returns 200 and pitch text when brands mentioned match brand_affinity", async () => {
    const fakeApiResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              pitch: "Cristiano Ronaldo has immense reach with sportswear enthusiasts.",
              brands_mentioned: ["Nike"],
            }),
          },
        },
      ],
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => fakeApiResponse,
    } as Response);

    const { req, res, getStatus, getData } = createMockReqRes("POST", {
      fullname: "Cristiano Ronaldo",
      brand_affinity: ["Nike"],
    });

    await handler(req, res);

    expect(getStatus()).toBe(200);
    expect(getData()).toEqual({
      pitch: "Cristiano Ronaldo has immense reach with sportswear enthusiasts.",
    });
  });

  it("returns 502 error when AI model hallucinates ungrounded brand names", async () => {
    const fakeApiResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              pitch: "Cristiano Ronaldo partners with Clear Men and Theragun.",
              brands_mentioned: ["Clear Men", "Theragun"],
            }),
          },
        },
      ],
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => fakeApiResponse,
    } as Response);

    const { req, res, getStatus, getData } = createMockReqRes("POST", {
      fullname: "Cristiano Ronaldo",
      brand_affinity: ["Nike"],
    });

    await handler(req, res);

    expect(getStatus()).toBe(502);
    expect(getData()).toEqual({
      error: "Pitch generation failed verification — please try again.",
    });
  });

  it("returns 200 when creator has no brand affinities and AI mentions no brands", async () => {
    const fakeApiResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              pitch: "Khaby Lame captivates massive global audiences without saying a word.",
              brands_mentioned: [],
            }),
          },
        },
      ],
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => fakeApiResponse,
    } as Response);

    const { req, res, getStatus, getData } = createMockReqRes("POST", {
      fullname: "Khaby Lame",
      brand_affinity: [],
    });

    await handler(req, res);

    expect(getStatus()).toBe(200);
    expect(getData()).toEqual({
      pitch: "Khaby Lame captivates massive global audiences without saying a word.",
    });
  });
});
