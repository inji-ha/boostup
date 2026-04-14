import { useState, type FormEvent } from "react";
import type { CSSProperties } from "react";
import type { Profile } from "../types";

type Props = {
  initial: Profile | null;
  onSave: (p: Profile) => void;
  onClear: () => void;
};

const label: CSSProperties = { display: "block", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.35rem" };
const input: CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.75rem",
  borderRadius: 10,
  border: "1px solid var(--line)",
  fontSize: "1rem",
  background: "#fff",
};

export function ProfileEditor({ initial, onSave, onClear }: Props) {
  const [nickname, setNickname] = useState(initial?.nickname ?? "");
  const [centerName, setCenterName] = useState(initial?.centerName ?? "");
  const [stayYearMonth, setStayYearMonth] = useState(initial?.stayYearMonth ?? "");
  const [region, setRegion] = useState(initial?.region ?? "");
  const [babyBirthMonth, setBabyBirthMonth] = useState(initial?.babyBirthMonth ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [contactHint, setContactHint] = useState(initial?.contactHint ?? "");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !centerName.trim() || !stayYearMonth || !region.trim()) {
      return;
    }
    const now = new Date().toISOString().slice(0, 10);
    const p: Profile = {
      id: initial?.id ?? `me-${Date.now()}`,
      nickname: nickname.trim(),
      centerName: centerName.trim(),
      stayYearMonth,
      region: region.trim(),
      babyBirthMonth: babyBirthMonth || undefined,
      bio: bio.trim() || "산후조리원 동기분들 반가워요!",
      contactHint: contactHint.trim() || undefined,
      createdAt: initial?.createdAt ?? now,
    };
    onSave(p);
  };

  return (
    <div style={{ paddingTop: "1.75rem", maxWidth: 480 }}>
      <h1 style={{ fontSize: "1.65rem", margin: "0 0 0.5rem" }}>내 프로필</h1>
      <p style={{ color: "var(--muted)", margin: "0 0 1.5rem", lineHeight: 1.55 }}>
        동기가 나를 알아볼 수 있게 적어 주세요. 닉네임은 실명 대신 쓰는 걸 권장해요.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
        <div>
          <label style={label} htmlFor="nickname">
            닉네임 <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <input
            id="nickname"
            style={input}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="예: 봄봄맘"
            required
            maxLength={24}
          />
        </div>
        <div>
          <label style={label} htmlFor="center">
            산후조리원 이름 <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <input
            id="center"
            style={input}
            value={centerName}
            onChange={(e) => setCenterName(e.target.value)}
            placeholder="예: OO 산후조리원"
            required
            maxLength={80}
          />
        </div>
        <div>
          <label style={label} htmlFor="ym">
            입소 연월 <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <input
            id="ym"
            type="month"
            style={input}
            value={stayYearMonth}
            onChange={(e) => setStayYearMonth(e.target.value)}
            required
          />
        </div>
        <div>
          <label style={label} htmlFor="region">
            거주 지역 <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <input
            id="region"
            style={input}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="예: 서울 강남구"
            required
            maxLength={40}
          />
        </div>
        <div>
          <label style={label} htmlFor="baby">
            아기 출생 연월 (선택)
          </label>
          <input
            id="baby"
            type="month"
            style={input}
            value={babyBirthMonth}
            onChange={(e) => setBabyBirthMonth(e.target.value)}
          />
        </div>
        <div>
          <label style={label} htmlFor="bio">
            한 줄 소개
          </label>
          <textarea
            id="bio"
            style={{ ...input, minHeight: 88, resize: "vertical" }}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="동기분들께 하고 싶은 말을 적어 보세요."
            maxLength={200}
          />
        </div>
        <div>
          <label style={label} htmlFor="contact">
            연락 힌트 (선택)
          </label>
          <input
            id="contact"
            style={input}
            value={contactHint}
            onChange={(e) => setContactHint(e.target.value)}
            placeholder="예: 오픈채팅 이름, 인스타 @아이디 (민감한 정보는 올리지 마세요)"
            maxLength={120}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", marginTop: "0.5rem" }}>
          <button
            type="submit"
            style={{
              border: "none",
              borderRadius: 12,
              padding: "0.85rem 1.5rem",
              fontWeight: 600,
              background: "var(--accent)",
              color: "#fff",
              fontSize: "1rem",
            }}
          >
            저장하고 동기 찾기
          </button>
          {initial && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("프로필을 이 기기에서 지울까요?")) onClear();
              }}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: "0.85rem 1.25rem",
                fontWeight: 500,
                background: "#fff",
                color: "var(--muted)",
              }}
            >
              프로필 지우기
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
