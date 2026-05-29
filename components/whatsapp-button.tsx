export default function WhatsAppButton() {
  const phone   = "5215540387231";
  const message = "Hola! Vi tu página y me gustaría recibir información sobre los planes de entrenamiento.";
  const url     = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 py-3 pl-3 pr-5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
      style={{
        background: "#25d366",
        boxShadow: "0 8px 32px rgba(37,211,102,0.35)",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="22"
        height="22"
        fill="white"
        className="shrink-0"
      >
        <path d="M16 .4C7.4.4.5 7.3.5 15.8c0 2.8.7 5.5 2.1 7.9L.2 31.6l8.1-2.4c2.3 1.3 4.9 2 7.7 2 8.6 0 15.5-6.9 15.5-15.4C31.5 7.3 24.6.4 16 .4zm0 28.3c-2.4 0-4.8-.6-6.9-1.8l-.5-.3-4.8 1.4 1.5-4.7-.3-.5c-1.3-2.1-2-4.5-2-7 0-7.3 6-13.3 13.4-13.3s13.4 6 13.4 13.3-6 13.4-13.8 13.4zm7.4-9.9c-.4-.2-2.5-1.2-2.9-1.4-.4-.1-.7-.2-1 .2s-1.1 1.4-1.4 1.6c-.3.2-.5.3-.9.1-.4-.2-1.8-.7-3.5-2.2-1.3-1.2-2.2-2.6-2.4-3-.3-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.5-.7.2-.3.1-.6 0-.8-.1-.2-1-2.3-1.4-3.1-.3-.7-.6-.6-1-.6h-.8c-.3 0-.8.1-1.2.6s-1.6 1.6-1.6 3.9 1.6 4.6 1.8 4.9c.2.3 3.2 5 7.8 6.8 1.1.5 2 .8 2.7 1 .9.3 1.7.2 2.3.1.7-.1 2.5-1 2.9-2 .4-1 .4-1.8.3-2-.1-.2-.4-.3-.8-.5z" />
      </svg>
      <span className="text-white text-xs font-bold tracking-wide">
        WhatsApp
      </span>
    </a>
  );
}