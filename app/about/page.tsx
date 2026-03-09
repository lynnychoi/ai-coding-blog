export default function AboutPage() {
  return (
    <div style={{ maxWidth: 660, margin: "0 auto", paddingTop: "2rem" }}>

      {/* Hero */}
      <div style={{ marginBottom: "3.5rem" }}>
        <p style={{
          fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.12em",
          color: "var(--accent-purple)", textTransform: "uppercase",
          marginBottom: "0.75rem"
        }}>
          About
        </p>
        <h1 style={{
          fontSize: "clamp(2rem, 6vw, 2.75rem)", fontWeight: 800,
          letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "0.75rem"
        }}>
          <span style={{
            background: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            Lynn Choi
          </span>
        </h1>
        <p style={{
          fontSize: "1rem", color: "var(--text-muted)",
          fontStyle: "italic", letterSpacing: "0.01em"
        }}>
          New York soul in Seoul
        </p>
      </div>


      {/* Story */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem" }}>
        <p style={{ color: "#cbd5e1", lineHeight: 1.85, fontSize: "0.95rem" }}>
          뉴욕에서 디자인을 전공했고, 한국에 와서 스타트업을 공동창업하게 됐다.
          디자이너로 합류했다가 기획자가 됐다.
          개발팀과 매일 붙어서 일했지만 코드를 직접 짠 건 아니었다.
          어렸을 때 아이폰 탈옥해서 이것저것 해본 적은 있지만.
        </p>

        <p style={{ color: "#cbd5e1", lineHeight: 1.85, fontSize: "0.95rem" }}>
          그러다 이번에 처음으로 직접 만들어보기 시작했다.
          육아 중이라 집에 있는 시간이 길어졌고, AI 하는 남편이 꼬드겼다.
          반신반의하며 Claude Code를 켰는데, 뭔가 되더라.
          지금은 내게 필요한 서비스들을 하나씩 만들어보고 있다.
        </p>
      </div>

      <p style={{ color: "#94a3b8", lineHeight: 1.85, fontSize: "0.95rem", marginBottom: "2rem" }}>
        직접 만들어보면서 한 가지를 깨달았다.
      </p>

      {/* Pull quote */}
      <div style={{
        margin: "0 0 3rem",
        padding: "2rem",
        background: "linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(96,165,250,0.06) 100%)",
        border: "1px solid rgba(167,139,250,0.2)",
        borderRadius: "16px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: -20, right: -10,
          fontSize: "8rem", lineHeight: 1, color: "rgba(167,139,250,0.07)",
          fontFamily: "Georgia, serif", fontWeight: 900, userSelect: "none",
          pointerEvents: "none"
        }}>
          "
        </div>
        <p style={{
          fontSize: "1.05rem", lineHeight: 1.75,
          color: "#e2e8f0", fontWeight: 500,
          letterSpacing: "-0.01em", margin: 0, position: "relative"
        }}>
          사람과 AI는 같은 실수를 반복한다. 기록하지 않으면.
        </p>
      </div>

      {/* Story continued */}
      <div style={{ marginBottom: "3rem" }}>
        <p style={{ color: "#cbd5e1", lineHeight: 1.85, fontSize: "0.95rem", marginBottom: "1rem" }}>
          그래서 이 블로그를 만들었다. Claude Code가 한 실수, 내가 배운 것들,
          직접 테스트하면서 깨달은 것들을 기록하기 위해서.
          나를 위해서이기도 하고, Claude를 위해서이기도 하다.
        </p>
        <p style={{ color: "#94a3b8", lineHeight: 1.85, fontSize: "0.95rem", marginBottom: 0 }}>
          비개발자로 Product을 만들어온 사람,
          AI 코딩으로 처음 직접 빌딩을 시작하는 사람들한테
          이 기록이 조금이라도 참고가 됐으면 한다.
        </p>
      </div>

      {/* Currently */}
      <div style={{
        marginBottom: "3rem",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "1.5rem",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, #fbbf24, #f472b6, #a78bfa)"
        }} />
        <h2 style={{
          fontSize: "0.75rem", fontWeight: 700, color: "var(--text-faint)",
          textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.25rem"
        }}>
          Currently
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            { dot: "#34d399", text: "육아 중 — 아이가 자는 틈에 코딩" },
            { dot: "#a78bfa", text: "Claude Code로 필요한 서비스 빌딩 중" },
            { dot: "#60a5fa", text: "기획자/디자이너 시각의 AI 코딩 기록 중" },
          ].map(({ dot, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: dot, flexShrink: 0,
                boxShadow: `0 0 6px ${dot}`
              }} />
              <span style={{ fontSize: "0.875rem", color: "#94a3b8" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Closing */}
      <p style={{
        color: "var(--text-faint)", fontSize: "0.9rem",
        lineHeight: 1.8, marginBottom: "2.5rem",
        fontStyle: "italic"
      }}>
        이 발자취가 쌓여서 뭐가 될지, 나도 아직 모른다.
      </p>

      {/* Links */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {[
          { label: "GitHub", href: "https://github.com/lynnychoi", color: "#e2e8f0" },
          { label: "Instagram", href: "https://instagram.com/lynn.y.choi", color: "#f472b6" },
        ].map(({ label, href, color }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{
            textDecoration: "none", fontSize: "0.875rem", fontWeight: 600,
            color, padding: "0.4rem 1rem", borderRadius: "999px",
            border: `1px solid ${color}30`, background: `${color}10`,
            transition: "opacity 0.15s"
          }}>
            {label} ↗
          </a>
        ))}
      </div>

    </div>
  );
}
