import { useState, useEffect } from "react";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

interface QueryResponse {
  id?: number;
  prompt?: string;
  response?: string;
  createdAt?: string;
}

export default function ChatUI() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<QueryResponse[]>([]);
  const [conversation, setConversation] = useState<Message[]>([]);

  useEffect(() => {
    fetch("/api-query-response")
      .then(res => res.json())
      .then(data => setHistory(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");
    const newConversation: Message[] = [
      ...conversation,
      { role: "user", content: prompt }
    ];
    const res = await fetch("/api-query-response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: newConversation }),
    });
    const data = await res.json();
    setConversation([
      ...newConversation,
      { role: "assistant", content: data.response }
    ]);
    setResponse(data.response || JSON.stringify(data));
    setPrompt("");
    setLoading(false);
    fetch("/api-query-response")
      .then(res => res.json())
      .then(data => setHistory(data));
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-xl p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4">
          AI Chat Demo
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            className="p-3 rounded border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your prompt..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading || !prompt.trim()}
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </form>
        <div className="min-h-[60px] p-4 bg-gray-100 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-100">
          {response ? response : "AI response will appear here."}
        </div>
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">History</h2>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {history.length === 0 && <li className="text-gray-500">No history yet.</li>}
            {history.map((item, idx) => (
              <li key={item.id ?? idx} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-300"><strong>Prompt:</strong> {item.prompt}</div>
                <div className="text-sm text-gray-800 dark:text-gray-100"><strong>Response:</strong> {item.response}</div>
                {item.createdAt && <div className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</div>}
              </li>
            ))}
          </ul>
        </div>
        <button
          className="mb-4 bg-gray-300 text-gray-800 px-4 py-2 rounded"
          onClick={() => setConversation([])}
          disabled={loading}
        >
          New Chat
        </button>
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Conversation</h2>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {conversation.map((msg, idx) => (
              <li key={idx} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <strong>{msg.role}:</strong> {msg.content}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 