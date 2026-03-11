import { useEffect, useMemo, useRef, useState } from "react";

const quickQuestions = [
  "What services do you offer?",
  "How can I contact you?",
  "Do you provide AI automation?",
];

const initialMessages = [
  {
    id: 1,
    role: "bot",
    text: "Hi, I am the BSS assistant. Ask me about services, contact, location, or pricing.",
  },
];

function getBotReply(input) {
  const value = input.toLowerCase();

  if (value.includes("service")) {
    return "We provide Corporate IT Services, AI-Based Automation, and HR & Payroll Consulting.";
  }

  if (value.includes("contact")) {
    return "You can reach us through the lead form on this page or WhatsApp for a quick response.";
  }

  if (value.includes("locat") || value.includes("where")) {
    return "Brilliant Systems Solutions is based in Madurai, with associated operations including Bhutan.";
  }

  if (value.includes("pricing") || value.includes("plan")) {
    return "We offer Basic, Professional, and Enterprise plans. You can check the Pricing section for details.";
  }

  if (value.includes("ai") || value.includes("automation")) {
    return "Yes. AI automation is one of our core offerings, including workflow automation and AI copilots.";
  }

  return "I can help with services, contact, location, AI automation, and pricing. Please try one of those keywords.";
}

export default function SimpleChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [nextId, setNextId] = useState(2);
  const listRef = useRef(null);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const sendMessage = (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text) return;

    const userMessage = {
      id: nextId,
      role: "user",
      text,
    };

    const botMessage = {
      id: nextId + 1,
      role: "bot",
      text: getBotReply(text),
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setNextId((prev) => prev + 2);
    setInput("");
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end">
      <div
        className={`mb-3 w-[min(20rem,90vw)] rounded-2xl border border-gray-200 bg-white shadow-xl transition-all duration-300 ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <p className="text-base font-semibold text-gray-900">BSS Assistant</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close chatbot"
          >
            x
          </button>
        </div>

        <div
          ref={listRef}
          className="max-h-72 space-y-4 overflow-y-auto px-5 py-5"
          aria-live="polite"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[86%] rounded-xl px-4 py-3 text-base leading-relaxed ${
                message.role === "user"
                  ? "ml-auto bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 px-5 py-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {quickQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                aria-label={`Ask: ${question}`}
              >
                {question}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your question"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              aria-label="Chat message input"
            />
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={!canSend}
              className="rounded-xl bg-blue-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              aria-label="Send chat message"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:scale-105 hover:bg-blue-700"
        aria-label={open ? "Minimize chatbot" : "Open chatbot"}
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 9h10M7 13h7m-9 8 2.1-3.4A9 9 0 1 1 21 12a9 9 0 0 1-9 9c-1.8 0-3.5-.5-5-1.4L5 21Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
