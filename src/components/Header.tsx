import type { CSSProperties } from "react";
import type { View } from "../types";

type Props = {
  view: View;
  onNavigate: (v: View) => void;
  hasProfile: boolean;
};

const btn: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "var(--muted)",
  fontSize: "0.92rem",
  fontWeight: 500,
  padding: "0.35rem 0.6rem",
  borderRadius: 8,
};

const btnActive: CSSProperties = {
  ...btn,
  color: "var(--accent)",
  background: "var(--accent-soft)",
};

export function Header({ view, onNavigate, hasProfile }: Props) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(253, 248, 246, 0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          padding: "0.85rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <button
          type="button"
          onClick={() => onNavigate("home")}
          style={{
            border: "none",
            background: "none",
            padding: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "1.35rem" }} aria-hidden>
            🤱
          </span>
          <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--ink)" }}>산후동기</span>
        </button>

        <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexWrap: "wrap" }}>
          <button type="button" style={view === "home" ? btnActive : btn} onClick={() => onNavigate("home")}>
            홈
          </button>
          <button type="button" style={view === "profile" ? btnActive : btn} onClick={() => onNavigate("profile")}>
            {hasProfile ? "내 프로필" : "프로필 만들기"}
          </button>
          <button type="button" style={view === "discover" ? btnActive : btn} onClick={() => onNavigate("discover")}>
            동기 찾기
          </button>
        </nav>
      </div>
    </header>
  );
}
