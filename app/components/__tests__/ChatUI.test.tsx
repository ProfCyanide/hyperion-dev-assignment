import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, beforeEach, vi, expect } from "vitest";
import ChatUI from "../ChatUI";

describe("ChatUI", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([]), // mock empty history
      })
    ) as any;
  });

  it("renders without crashing", () => {
    render(<ChatUI />);
  });

  it("renders input, button, AI response placeholder, and history section", () => {
    render(<ChatUI />);
    expect(screen.getByPlaceholderText(/enter your prompt/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
    expect(screen.getByText(/AI response will appear here/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /history/i })).toBeInTheDocument();
  });

  it("disables send button when input is empty", () => {
    render(<ChatUI />);
    const button = screen.getByRole("button", { name: /send/i });
    expect(button).toBeDisabled();
  });

  it("enables send button when input is not empty", async () => {
    const user = userEvent.setup();
    render(<ChatUI />);
    const input = screen.getByPlaceholderText(/enter your prompt/i);
    const button = screen.getByRole("button", { name: /send/i });
    await user.type(input, "Hello");
    expect(button).not.toBeDisabled();
  });

  it("shows loading state when submitting", async () => {
    const user = userEvent.setup();
    let resolveFetch: (value: any) => void;
    (global.fetch as any) = vi.fn(() => new Promise(res => {
      resolveFetch = res;
    }));
    render(<ChatUI />);
    const input = screen.getByPlaceholderText(/enter your prompt/i);
    const button = screen.getByRole("button", { name: /send/i });
    await user.type(input, "Hello AI");
    await user.click(button);
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/thinking/i);
    // Resolve fetch to finish loading
    resolveFetch!({ json: () => Promise.resolve({ response: "Hi!" }) });
  });

  it("displays AI response after submit", async () => {
    const user = userEvent.setup();
    (global.fetch as any) = vi.fn()
      .mockImplementationOnce(() => Promise.resolve({ json: () => Promise.resolve([]) })) // initial history
      .mockImplementationOnce(() => Promise.resolve({ json: () => Promise.resolve({ response: "AI says hi" }) })) // POST
      .mockImplementation(() => Promise.resolve({ json: () => Promise.resolve([]) })); // history refresh
    render(<ChatUI />);
    const input = screen.getByPlaceholderText(/enter your prompt/i);
    const button = screen.getByRole("button", { name: /send/i });
    await user.type(input, "Hello");
    await user.click(button);
    const aiResponses = await screen.findAllByText(/AI says hi/);
    expect(aiResponses.length).toBeGreaterThanOrEqual(1);
  });

  it("displays history items", async () => {
    (global.fetch as any) = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([
          { id: 1, prompt: "hi", response: "hello", createdAt: new Date().toISOString() },
        ]),
      })
    );
    render(<ChatUI />);
    expect(await screen.findByText(/prompt:/i)).toBeInTheDocument();
    expect(screen.getByText(/hi/)).toBeInTheDocument();
    expect(screen.getByText(/response:/i)).toBeInTheDocument();
    expect(screen.getByText(/hello/)).toBeInTheDocument();
  });

  it("clicking 'New Chat' clears the conversation", async () => {
    const user = userEvent.setup();
    (global.fetch as any) = vi.fn()
      .mockImplementationOnce(() => Promise.resolve({ json: () => Promise.resolve([]) })) // initial history
      .mockImplementationOnce(() => Promise.resolve({ json: () => Promise.resolve({ response: "AI says hi" }) })) // POST
      .mockImplementation(() => Promise.resolve({ json: () => Promise.resolve([]) })); // history refresh
    render(<ChatUI />);
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
});