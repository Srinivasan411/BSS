const DEFAULT_MESSAGE = `Hello BSS Team,\nI am interested in your services.\nPlease share more details.`;

export default function WhatsAppButton({ phoneNumber, message = DEFAULT_MESSAGE }) {
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title="Chat on WhatsApp"
      className="group fixed bottom-6 left-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transition duration-300 hover:scale-105 hover:shadow-xl"
      aria-label="Chat on WhatsApp"
    >
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.6 14.3c-.3-.1-1.8-.9-2-.9-.3-.1-.4-.1-.6.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.4-3.7-3.1-.3-.4.3-.4.8-1.5.1-.2.1-.4 0-.6-.1-.1-.6-1.5-.9-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.6.1-.9.4-.3.3-1.1 1-1.1 2.5s1.1 2.9 1.3 3.1c.2.2 2.2 3.4 5.4 4.8.8.3 1.4.5 1.8.6.8.2 1.4.1 2 .1.6-.1 1.8-.8 2-1.6.3-.8.3-1.5.2-1.6-.1-.1-.2-.2-.5-.3z" />
        <path d="M12 2a10 10 0 0 0-8.8 14.8L2 22l5.4-1.4A10 10 0 1 0 12 2zm0 18.1a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3.2.8.9-3.1-.2-.3A8.1 8.1 0 1 1 12 20.1z" />
      </svg>
      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
        Chat on WhatsApp
      </span>
    </a>
  );
}
