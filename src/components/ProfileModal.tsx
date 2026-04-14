import type { CSSProperties } from "react";
import type { Profile } from "../types";

type Props = {
  profile: Profile;
  onClose: () => void;
  onCopied: () => void;
};

function buildGreeting(p: Profile) {
  const lines = [
    `안녕하세요, ${p.nickname} 님.`,
    `산후조리원 동기로 인사드려요. (${p.centerName}, ${p.stayYearMonth} 입소 기준으로 찾았어요.)`,
    p.bio ? `저는 이렇게 지내고 있어요: ${p.bio}` : "",
    "연락 주시면 반가울 것 같아요. 좋은 하루 보내세요!",
  ].filter(Boolean);
  return lines.join("\n");
}

const overlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(45, 36, 32, 0.45)",
  zIndex: 50,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  padding: "1rem",
};

const sheet: CSSProperties = {
  background: "var(--surface)",
  borderRadius: "20px 20px 12px 12px",
  maxWidth: 440,
  width: "100%",
  maxHeight: "88vh",
  overflow: "auto",
  boxShadow: "var(--shadow)",
  padding: "1.35rem 1.35rem 1.5rem",
};

export function ProfileModal({ profile: p, onClose, onCopied }: Props) {
  const text = buildGreeting(p);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      onCopied();
    } catch {
      window.prompt("복사할 내용:", text);
    }
  };

  return (
    <div style={overlay} role="presentation" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={sheet}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 id="modal-title" style={{ margin: 0, fontSize: "1.2rem" }}>
            {p.nickname}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            style={{
              border: "none",
              background: "var(--accent-soft)",
              width: 36,
              height: 36,
              borderRadius: 10,
              fontSize: "1.1rem",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <dl style={{ margin: "0 0 1rem", fontSize: "0.92rem", lineHeight: 1.55 }}>
          <dt style={{ color: "var(--muted)", fontWeight: 600 }}>산후조리원</dt>
          <dd style={{ margin: "0.15rem 0 0.65rem" }}>{p.centerName}</dd>
          <dt style={{ color: "var(--muted)", fontWeight: 600 }}>입소 연월</dt>
          <dd style={{ margin: "0.15rem 0 0.65rem" }}>{p.stayYearMonth}</dd>
          <dt style={{ color: "var(--muted)", fontWeight: 600 }}>지역</dt>
          <dd style={{ margin: "0.15rem 0 0.65rem" }}>{p.region}</dd>
          {p.babyBirthMonth && (
            <>
              <dt style={{ color: "var(--muted)", fontWeight: 600 }}>아기 출생 연월</dt>
              <dd style={{ margin: "0.15rem 0 0.65rem" }}>{p.babyBirthMonth}</dd>
            </>
          )}
          {p.contactHint && (
            <>
              <dt style={{ color: "var(--muted)", fontWeight: 600 }}>연락 힌트</dt>
              <dd style={{ margin: "0.15rem 0 0.65rem", wordBreak: "break-word" }}>{p.contactHint}</dd>
            </>
          )}
        </dl>

        <p style={{ fontSize: "0.88rem", color: "var(--muted)", margin: "0 0 0.75rem" }}>인사말 미리보기</p>
        <pre
          style={{
            margin: "0 0 1rem",
            padding: "0.85rem",
            background: "var(--bg)",
            borderRadius: 10,
            fontSize: "0.85rem",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            border: "1px solid var(--line)",
            fontFamily: "inherit",
          }}
        >
          {text}
        </pre>

        <button
          type="button"
          onClick={copy}
          style={{
            width: "100%",
            border: "none",
            borderRadius: 12,
            padding: "0.85rem",
            fontWeight: 600,
            background: "var(--accent)",
            color: "#fff",
            fontSize: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          인사말 복사하기
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: "100%",
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: "0.75rem",
            fontWeight: 500,
            background: "#fff",
            color: "var(--muted)",
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
