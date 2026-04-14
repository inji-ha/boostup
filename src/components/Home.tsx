import type { CSSProperties } from "react";
import type { Profile } from "../types";

type Props = {
  me: Profile | null;
  onGoProfile: () => void;
  onGoDiscover: () => void;
};

const card: CSSProperties = {
  background: "var(--surface)",
  borderRadius: "var(--radius)",
  boxShadow: "var(--shadow)",
  padding: "1.75rem",
  border: "1px solid var(--line)",
};

const primaryBtn: CSSProperties = {
  border: "none",
  borderRadius: 12,
  padding: "0.85rem 1.35rem",
  fontSize: "1rem",
  fontWeight: 600,
  background: "var(--accent)",
  color: "#fff",
  width: "100%",
  maxWidth: 280,
};

const secondaryBtn: CSSProperties = {
  ...primaryBtn,
  background: "var(--surface)",
  color: "var(--accent)",
  border: "2px solid var(--accent)",
};

export function Home({ me, onGoProfile, onGoDiscover }: Props) {
  return (
    <div style={{ paddingTop: "2.25rem" }}>
      <p style={{ fontSize: "0.95rem", color: "var(--accent)", fontWeight: 600, margin: "0 0 0.35rem" }}>
        산후조리원 동기 연결
      </p>
      <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.35rem)", fontWeight: 700, margin: "0 0 1rem", lineHeight: 1.25 }}>
        그때 같은 방,
        <br />
        같은 밥상이었던 동기를
        <br />
        다시 만나 보세요
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.65, margin: "0 0 2rem", maxWidth: 520 }}>
        조리원 이름·입소 시기·지역으로 동기를 찾고, 가벼운 인사말을 복사해 카카오톡이나 SNS로 연락해 보세요.
        (이 데모는 내 기기에만 저장됩니다.)
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2.5rem" }}>
        {!me && (
          <button type="button" style={primaryBtn} onClick={onGoProfile}>
            프로필 만들고 동기 찾기
          </button>
        )}
        {me && (
          <div style={card}>
            <p style={{ margin: "0 0 0.5rem", fontWeight: 600 }}>안녕하세요, {me.nickname} 님</p>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem" }}>
              {me.centerName} · {me.stayYearMonth} 입소 · {me.region}
            </p>
          </div>
        )}
        <button type="button" style={me ? primaryBtn : secondaryBtn} onClick={onGoDiscover}>
          동기 둘러보기
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {[
          { t: "조리원·시기 매칭", d: "같은 곳, 비슷한 입소 달을 기준으로 목록을 좁혀요." },
          { t: "부담 없는 첫 인사", d: "미리 쓴 인사말을 복사해 연락 방법에 붙여넣을 수 있어요." },
          { t: "내 정보는 내 폰에", d: "프로필은 브라우저 저장소에만 남고 서버로 가지 않아요." },
        ].map((x) => (
          <div key={x.t} style={{ ...card, padding: "1.25rem" }}>
            <p style={{ fontWeight: 600, margin: "0 0 0.4rem" }}>{x.t}</p>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>{x.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
