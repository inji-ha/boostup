import { useState, useMemo } from "react";
import type { Profile, View } from "./types";
import { useProfiles } from "./hooks/useProfiles";
import { Header } from "./components/Header";
import { Home } from "./components/Home";
import { ProfileEditor } from "./components/ProfileEditor";
import { Discover } from "./components/Discover";
import { ProfileModal } from "./components/ProfileModal";

export default function App() {
  const { me, setMe, allOthers } = useProfiles();
  const [view, setView] = useState<View>("home");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  };

  const go = (v: View) => {
    setView(v);
    setSelected(null);
  };

  const filteredKey = useMemo(() => `${me?.id ?? "anon"}-${allOthers.length}`, [me?.id, allOthers.length]);

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Header
        view={view}
        onNavigate={go}
        hasProfile={!!me}
      />

      <main style={{ flex: 1, width: "100%", maxWidth: 920, margin: "0 auto", padding: "0 1.25rem 3rem" }}>
        {view === "home" && (
          <Home
            me={me}
            onGoProfile={() => go("profile")}
            onGoDiscover={() => go("discover")}
          />
        )}
        {view === "profile" && (
          <ProfileEditor
            key={me?.id ?? "new"}
            initial={me}
            onSave={(p) => {
              setMe(p);
              showToast("프로필이 저장되었어요.");
              go("discover");
            }}
            onClear={() => {
              setMe(null);
              showToast("프로필을 지웠어요.");
            }}
          />
        )}
        {view === "discover" && (
          <Discover
            key={filteredKey}
            me={me}
            others={allOthers}
            onSelect={setSelected}
          />
        )}
      </main>

      <footer
        style={{
          padding: "1rem 1.25rem 1.5rem",
          fontSize: "0.8rem",
          color: "var(--muted)",
          textAlign: "center",
          borderTop: "1px solid var(--line)",
          background: "rgba(255,255,255,0.6)",
        }}
      >
        산후동기는 데모 앱입니다. 데이터는 이 기기 브라우저에만 저장됩니다. 실제 서비스는 안전한 인증과
        개인정보 처리가 필요합니다.
      </footer>

      {selected && (
        <ProfileModal
          profile={selected}
          onClose={() => setSelected(null)}
          onCopied={() => showToast("인사말을 복사했어요. 붙여넣기 해 보세요.")}
        />
      )}

      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--ink)",
            color: "#fff",
            padding: "0.65rem 1.25rem",
            borderRadius: 999,
            fontSize: "0.9rem",
            boxShadow: "var(--shadow)",
            zIndex: 60,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
