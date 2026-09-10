import { IcoChat } from "../common/icons";

export default function FloatingChatBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute", bottom: 82, right: 18, zIndex: 40,
        width: 52, height: 52, borderRadius: "50%",
        background: "var(--color-blue)",
        color: "#fff",
        boxShadow: "0 4px 16px rgba(37,99,235,0.40)",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "none", cursor: "pointer",
      }}
      className="active:scale-95 transition-transform"
    >
      <IcoChat />
    </button>
  );
}
