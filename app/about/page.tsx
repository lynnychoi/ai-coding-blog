export default function AboutPage() {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: "3rem" }}>

      {/* Header */}
      <div style={{ marginBottom: "3.5rem" }}>
        <p style={{
          fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.14em",
          color: "var(--text-3)", textTransform: "uppercase",
          fontFamily: "'Fira Code', monospace", marginBottom: "1.25rem"
        }}>
          About
        </p>
        <h1 style={{
          fontSize: "clamp(2rem, 6vw, 2.75rem)", fontWeight: 800,
          letterSpacing: "-0.04em", lineHeight: 1.05,
          marginBottom: "0.5rem", color: "var(--text)"
        }}>
          Lynn Choi
        </h1>
        <p style={{
          fontSize: "0.95rem", color: "var(--text-3)",
          fontStyle: "italic", letterSpacing: "0.01em"
        }}>
          New York soul in Seoul
        </p>
      </div>

      {/* Story */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem" }}>
        <p style={{ color: "var(--text-2)", lineHeight: 1.85, fontSize: "0.93rem" }}>
          뉴욕에서 디자인을 전공했고, 한국에 와서 스타트업을 공동창업하게 됐다.
          디자이너로 합류했다가 기획자가 됐다.
          개발팀과 매일 붙어서 일했지만 코드를 직접 짠 건 아니었다.
          어렸을 때 아이폰 탈옥해서 이것저것 해본 적은 있지만.
        </p>
        <p style={{ color: "var(--text-2)", lineHeight: 1.85, fontSize: "0.93rem" }}>
          그러다 이번에 처음으로 직접 만들어보기 시작했다.
          육아 중이라 집에 있는 시간이 길어졌고, AI 하는 남편이 꼬드겼다.
          반신반의하며 Claude Code를 켰는데, 뭔가 되더라.
          지금은 내게 필요한 서비스들을 하나씩 만들어보고 있다.
        </p>
      </div>

      {/* Pull quote */}
      <div style={{ marginBottom: "3rem" }}>
        <p style={{
          color: "var(--text-3)", lineHeight: 1.85, fontSize: "0.93rem",
          marginBottom: "1.5rem"
        }}>
          직접 만들어보면서 한 가지를 깨달았다.
        </p>
        <blockquote style={{
          borderLeft: "2px solid var(--accent)",
          padding: "0.75rem 1.25rem",
          background: "var(--accent-dim)",
          borderRadius: "0 6px 6px 0",
          margin: 0,
        }}>
          <p style={{
            fontSize: "1.05rem", lineHeight: 1.75,
            color: "var(--text)", fontWeight: 500,
            letterSpacing: "-0.01em", margin: 0,
          }}>
            사람과 AI는 같은 실수를 반복한다. 기록하지 않으면.
          </p>
        </blockquote>
      </div>

      {/* Story continued */}
      <div style={{ marginBottom: "3.5rem" }}>
        <p style={{ color: "var(--text-2)", lineHeight: 1.85, fontSize: "0.93rem", marginBottom: "1rem" }}>
          그래서 이 블로그를 만들었다. Claude Code가 한 실수, 내가 배운 것들,
          직접 테스트하면서 깨달은 것들을 기록하기 위해서.
          나를 위해서이기도 하고, Claude를 위해서이기도 하다.
        </p>
        <p style={{ color: "var(--text-3)", lineHeight: 1.85, fontSize: "0.93rem" }}>
          비개발자로 Product을 만들어온 사람,
          AI 코딩으로 처음 직접 빌딩을 시작하는 사람들한테
          이 기록이 조금이라도 참고가 됐으면 한다.
        </p>
      </div>

      {/* Currently */}
      <div style={{ marginBottom: "3.5rem" }}>
        <p style={{
          fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.14em",
          color: "var(--text-3)", textTransform: "uppercase",
          fontFamily: "'Fira Code', monospace", marginBottom: "1rem"
        }}>
          Currently
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {[
            "육아 중 — 아이가 자는 틈에 코딩",
            "Claude Code로 필요한 서비스 빌딩 중",
            "기획자/디자이너 시각의 AI 코딩 기록 중",
          ].map((text) => (
            <div key={text} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
              <span style={{
                width: 4, height: 4, borderRadius: "50%",
                background: "var(--accent)", flexShrink: 0,
                marginTop: "0.55rem", display: "block"
              }} />
              <span style={{ fontSize: "0.875rem", color: "var(--text-2)", lineHeight: 1.6 }}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Closing */}
      <p style={{
        color: "var(--text-3)", fontSize: "0.875rem",
        lineHeight: 1.8, marginBottom: "2.5rem", fontStyle: "italic"
      }}>
        이 발자취가 쌓여서 뭐가 될지, 나도 아직 모른다.
      </p>

      {/* Links */}
      <div style={{ display: "flex", gap: "0.625rem" }}>
        {[
          { label: "GitHub", href: "https://github.com/lynnychoi" },
          { label: "Instagram", href: "https://instagram.com/lynn.y.choi" },
        ].map(({ label, href }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{
            textDecoration: "none", fontSize: "0.8rem", fontWeight: 500,
            color: "var(--text-3)", padding: "0.35rem 0.875rem",
            borderRadius: "5px", border: "1px solid var(--border)",
            transition: "color 0.15s, border-color 0.15s",
            fontFamily: "'Fira Code', monospace"
          }}>
            {label} ↗
          </a>
        ))}
      </div>

    </div>
  );
}
