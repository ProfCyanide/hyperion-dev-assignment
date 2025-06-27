import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loader, action } from "../route";
import { prisma as mockPrisma } from "../../../prisma.server";
import type { Mock } from "vitest";

// Mock prisma
vi.mock("../../../prisma.server", () => ({
  prisma: {
    queryResponse: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("api-query-response route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("loader returns JSON with all query responses", async () => {
    ((mockPrisma.queryResponse.findMany as unknown) as Mock).mockResolvedValueOnce([
      { id: 1, prompt: "hi", response: "hello", createdAt: new Date().toISOString() },
    ]);
    const res = await loader({} as any);
    expect(res).toBeInstanceOf(Response);
    const response = res as Response;
    expect(response.headers.get("Content-Type")).toBe("application/json");
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].prompt).toBe("hi");
  });

  it("action returns 400 for invalid input", async () => {
    const req = { json: () => Promise.resolve({ messages: [] }) } as any;
    const res = await action({ request: req } as any);
    expect(res).toBeInstanceOf(Response);
    const response = res as Response;
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toMatch(/invalid input/i);
  });

  it("action returns 500 for OpenAI error", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ error: { message: "quota exceeded" } }),
      })
    ) as any;
    const req = { json: () => Promise.resolve({ messages: [{ role: "user", content: "hi" }] }) } as any;
    const res = await action({ request: req } as any);
    expect(res).toBeInstanceOf(Response);
    const response = res as Response;
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toMatch(/quota exceeded/i);
  });

  it("action returns saved response for valid input", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ choices: [{ message: { content: "AI says hi" } }] }),
      })
    ) as any;
    ((mockPrisma.queryResponse.create as unknown) as Mock).mockResolvedValueOnce({
      id: 2,
      prompt: "hi",
      response: "AI says hi",
      createdAt: new Date().toISOString(),
    });
    const req = { json: () => Promise.resolve({ messages: [{ role: "user", content: "hi" }] }) } as any;
    const res = await action({ request: req } as any);
    expect(res).toBeInstanceOf(Response);
    const response = res as Response;
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.response).toBe("AI says hi");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
}); 