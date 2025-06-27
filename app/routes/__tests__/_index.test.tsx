import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, beforeEach, vi, expect } from "vitest";
import Index from "../_index";

describe("Index page", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([]), // mock empty history
      })
    ) as any;
  });

  it("renders input and button", () => {
    render(<Index />);
    expect(screen.getByPlaceholderText(/enter your prompt/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("renders AI response placeholder", () => {
    render(<Index />);
    expect(screen.getByText(/AI response will appear here/i)).toBeInTheDocument();
  });

  it("renders history section and 'No history yet.' when empty", () => {
    render(<Index />);
    expect(screen.getByRole("heading", { name: /history/i })).toBeInTheDocument();
    expect(screen.getByText(/no history yet/i)).toBeInTheDocument();
  });

  it("disables send button when input is empty", () => {
    render(<Index />);
    const button = screen.getByRole("button", { name: /send/i });
    expect(button).toBeDisabled();
  });

  it("submits a prompt and shows loading state", async () => {
    const user = userEvent.setup();
    let resolveFetch: (value: any) => void;
    (global.fetch as any) = vi.fn(() => new Promise(res => {
      resolveFetch = res;
    }));
    render(<Index />);
    const input = screen.getByPlaceholderText(/enter your prompt/i);
    const button = screen.getByRole("button", { name: /send/i });
    await user.type(input, "Hello AI");
    expect(button).not.toBeDisabled();
    await user.click(button);
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/thinking/i);
    // Resolve fetch to finish loading
    resolveFetch!({ json: () => Promise.resolve({ response: "Hi!" }) });
  });

  it("renders a history item if fetch returns data", async () => {
    (global.fetch as any) = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([
          { id: 1, prompt: "hi", response: "hello", createdAt: new Date().toISOString() },
        ]),
      })
    );
    render(<Index />);
    expect(await screen.findByText(/prompt:/i)).toBeInTheDocument();
    expect(screen.getByText(/hi/)).toBeInTheDocument();
    expect(screen.getByText(/response:/i)).toBeInTheDocument();
    expect(screen.getByText(/hello/)).toBeInTheDocument();
  });

  it("clicking 'New Chat' clears the conversation", async () => {
    const user = userEvent.setup();
    // Mock fetch for initial history and for POST
    (global.fetch as any) = vi.fn()
      .mockImplementationOnce(() => Promise.resolve({ json: () => Promise.resolve([]) })) // initial history
      .mockImplementationOnce(() => Promise.resolve({ json: () => Promise.resolve({ response: "AI says hi" }) })) // POST
      .mockImplementation(() => Promise.resolve({ json: () => Promise.resolve([]) })); // history refresh
    render(<Index />);
    const input = screen.getByPlaceholderText(/enter your prompt/i);
    const button = screen.getByRole("button", { name: /send/i });
    await user.type(input, "Hello");
    await user.click(button);
    // Wait for AI response to appear in conversation
    expect(await screen.findByText(/assistant:/i)).toBeInTheDocument();
    // Click New Chat
    const newChatBtn = screen.getByRole("button", { name: /new chat/i });
    await user.click(newChatBtn);
    // Conversation should be cleared (no assistant/user messages)
    expect(screen.queryByText(/assistant:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/user:/i)).not.toBeInTheDocument();
  });

  it("sends a prompt and displays the AI response and updates history", async () => {
    // Mock fetch for initial history, POST, and history refresh
    (global.fetch as any) = vi.fn()
      .mockImplementationOnce(() => Promise.resolve({ json: () => Promise.resolve([]) })) // initial history
      .mockImplementationOnce(() => Promise.resolve({ json: () => Promise.resolve({ response: "AI integration response" }) })) // POST
      .mockImplementation(() => Promise.resolve({ json: () => Promise.resolve([
        { id: 1, prompt: "integration test", response: "AI integration response", createdAt: new Date().toISOString() }
      ]) })); // history refresh

    render(<Index />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText(/enter your prompt/i);
    const button = screen.getByRole("button", { name: /send/i });

    await user.type(input, "integration test");
    await user.click(button);

    // Wait for AI response in UI
    const aiResponses = await screen.findAllByText(/AI integration response/);
    expect(aiResponses.length).toBeGreaterThanOrEqual(1);

    // Wait for history to update
    const promptMatches = await screen.findAllByText(/integration test/);
    expect(promptMatches.length).toBeGreaterThanOrEqual(1);
  });
});