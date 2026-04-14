import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { Profile } from "../types";

type Props = {
  me: Profile | null;
  others: Profile[];
  onSelect: (p: Profile) => void;
};

const card: CSSProperties = {
  background: "var(--surface)",
  borderRadius: "var(--radius)",
  border: "1px solid var(--line)",
  padding: "1.15rem 1.25rem",
  textAlign: "left",
  cursor: "pointer",
  transition: "box-shadow 0.2s, transform 0.15s",
  boxShadow: "0 4px 16px rgba(45,36,32,0.04)",
};

function formatMonth(ym: string) {
  const [y, m] = ym.split("-");
  if (!y || !m) return ym;
  return `${y}년 ${parseInt(m, 10)}월`;
}

export function Discover({ me, others, onSelect }: Props) {
  const [qCenter, setQCenter] = useState(me?.centerName ?? "");
  const [qMonth, setQMonth] = useState(me?.stayYearMonth ?? "");
  const [qRegion, setQRegion] = useState("");

  const filtered = useMemo(() => {
    const c = qCenter.trim().toLowerCase();
    const r = qRegion.trim().toLowerCase();
    return others.filter((p) => {
      if (c && !p.centerName.toLowerCase().includes(c)) return false;
      if (qMonth && p.stayYearMonth !== qMonth) return false;
      if (r && !p.region.toLowerCase().includes(r)) return false;
      return true;
    });
  }, [others, qCenter, qMonth, qRegion]);

  return (
    <div style={{ paddingTop: "1.75rem" }}>
      <h1 style={{ fontSize: "1.65rem", margin: "0 0 0.5rem" }}>동기 찾기</h1>
      <p style={{ color: "var(--muted)", margin: "0 0 1.25rem" }}>
        필터를 조정해 같은 조리원·같은 입소 달·지역이 맞는 분을 찾아 보세요.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem" }}>
            조리원 이름 포함
          </label>
          <input
            value={qCenter}
            onChange={(e) => setQCenter(e.target.value)}
            placeholder="검색어"
            style={{
              width: "100%",
              padding: "0.55rem 0.65rem",
              borderRadius: 10,
              border: "1px solid var(--line)",
              fontSize: "0.95rem",
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem" }}>
            입소 연월 일치
          </label>
          <input
            type="month"
            value={qMonth}
            onChange={(e) => setQMonth(e.target.value)}
            style={{
              width: "100%",
              padding: "0.55rem 0.65rem",
              borderRadius: 10,
              border: "1px solid var(--line)",
              fontSize: "0.95rem",
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem" }}>
            지역 포함
          </label>
          <input
            value={qRegion}
            onChange={(e) => setQRegion(e.target.value)}
            placeholder="예: 강남"
            style={{
              width: "100%",
              padding: "0.55rem 0.65rem",
              borderRadius: 10,
              border: "1px solid var(--line)",
              fontSize: "0.95rem",
            }}
          />
        </div>
      </div>

      <p style={{ fontSize: "0.9rem", color: "var(--muted)", margin: "0 0 1rem" }}>
        {filtered.length}명 표시 중 (샘플 프로필 포함)
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
        {filtered.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p)}
            style={card}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(45,36,32,0.04)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{p.nickname}</span>
                <p style={{ margin: "0.35rem 0 0", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.45 }}>
                  {p.centerName}
                  <br />
                  {formatMonth(p.stayYearMonth)} 입소 · {p.region}
                </p>
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: 600, flexShrink: 0 }}>자세히</span>
            </div>
            <p style={{ margin: "0.65rem 0 0", fontSize: "0.92rem", lineHeight: 1.5 }}>{p.bio}</p>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: "var(--muted)", padding: "2rem 0", textAlign: "center" }}>
          조건에 맞는 프로필이 없어요. 검색어를 줄이거나 입소 연월 필터를 비워 보세요.
        </p>
      )}
    </div>
  );
}
