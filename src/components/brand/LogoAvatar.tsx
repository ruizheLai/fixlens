import Logo from "../../imports/Logo/index";

export default function LogoAvatar({ size = 32 }: { size?: number }) {
  const pad = Math.round(size * 0.14);
  return (
    <div className="shrink-0 rounded-full overflow-hidden flex items-center justify-center" style={{ width: size, height: size, background: "#fff", border: "1px solid #E4E4E1", padding: pad }}>
      <Logo />
    </div>
  );
}
