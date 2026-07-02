export default function AuthVisual() {
  return (
    <div className="auth-visual">
      <div className="visual-inner">

        {/* Coach card */}
        <div className="coach-card">
          <div className="coach-avatar">🏋️</div>
          <div className="coach-meta">
            <div className="coach-name">Coach Bahaa</div>
            <div className="coach-title">Certified Nutrition & Fitness Coach</div>
          </div>
          <div className="coach-stats">
            <div className="coach-stat">
              <div className="num">250+</div>
              <div className="lbl">Active Clients</div>
            </div>
            <div className="coach-stat">
              <div className="num">8</div>
              <div className="lbl">Years Exp.</div>
            </div>
          </div>
        </div>

        {/* ── DUMBBELL HERO ── */}
        <div className="gym-hero">

          {/* Floating card A – top left */}
          <div className="float-card float-card-a">
            <div className="float-card-icon">🔥</div>
            <div>
              <div className="float-card-val">420 kcal</div>
              <div className="float-card-lbl">Today's burn</div>
            </div>
          </div>

          {/* Floating card B – top right */}
          <div className="float-card float-card-b">
            <div className="float-card-icon">🏆</div>
            <div>
              <div className="float-card-val">28 days</div>
              <div className="float-card-lbl">Current streak</div>
            </div>
          </div>

          {/* Dumbbell SVG */}
          <svg
            className="gym-dumbbell"
            viewBox="0 0 420 170"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="db-main" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6b35" />
                <stop offset="100%" stopColor="#ff3d71" />
              </linearGradient>
              <linearGradient id="db-bar" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff8a5b" />
                <stop offset="100%" stopColor="#cc4c20" />
              </linearGradient>
              <linearGradient id="db-plate" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff7543" />
                <stop offset="100%" stopColor="#e8294a" />
              </linearGradient>
            </defs>

            {/* Glow aura behind */}
            <ellipse cx="210" cy="85" rx="130" ry="52" fill="rgba(255,107,53,0.07)" />
            <ellipse cx="210" cy="85" rx="90"  ry="36" fill="rgba(255,61,113,0.05)" />

            {/* ── BAR ── */}
            <rect x="128" y="76" width="164" height="18" rx="9" fill="url(#db-bar)" />
            {/* bar top shine */}
            <rect x="130" y="77" width="160" height="6" rx="3" fill="rgba(255,255,255,0.18)" />

            {/* ── LEFT COLLAR ── */}
            <rect x="112" y="64" width="22" height="42" rx="7" fill="url(#db-main)" />
            <rect x="113" y="65" width="20" height="6"  rx="3" fill="rgba(255,255,255,0.2)" />

            {/* ── RIGHT COLLAR ── */}
            <rect x="286" y="64" width="22" height="42" rx="7" fill="url(#db-main)" />
            <rect x="287" y="65" width="20" height="6"  rx="3" fill="rgba(255,255,255,0.2)" />

            {/* ── LEFT PLATE OUTER ── */}
            <rect x="48" y="38" width="68" height="94" rx="14" fill="url(#db-plate)" />
            <rect x="49" y="39" width="64" height="8"  rx="4" fill="rgba(255,255,255,0.2)" />
            {/* inner cutout illusion */}
            <rect x="60" y="52" width="44" height="66" rx="10" fill="rgba(10,6,4,0.38)" />
            <rect x="70" y="64" width="24" height="42" rx="6"  fill="rgba(255,255,255,0.04)" />
            {/* left plate edge shadow */}
            <rect x="109" y="38" width="7"  height="94" rx="3" fill="rgba(0,0,0,0.25)" />

            {/* ── RIGHT PLATE OUTER ── */}
            <rect x="304" y="38" width="68" height="94" rx="14" fill="url(#db-plate)" />
            <rect x="305" y="39" width="64" height="8"  rx="4" fill="rgba(255,255,255,0.2)" />
            {/* inner cutout illusion */}
            <rect x="316" y="52" width="44" height="66" rx="10" fill="rgba(10,6,4,0.38)" />
            <rect x="326" y="64" width="24" height="42" rx="6"  fill="rgba(255,255,255,0.04)" />
            {/* right plate edge shadow */}
            <rect x="304" y="38" width="7"  height="94" rx="3" fill="rgba(0,0,0,0.18)" />

            {/* ── CENTER KNURL LINES on bar ── */}
            {[0,1,2,3,4,5,6].map(i => (
              <rect key={i} x={168 + i * 13} y="78" width="7" height="14" rx="1"
                fill="rgba(0,0,0,0.18)" />
            ))}
          </svg>

          {/* Floating card C – bottom center */}
          <div className="float-card float-card-c">
            <div className="float-card-icon">📉</div>
            <div>
              <div className="float-card-val">−2.4 kg</div>
              <div className="float-card-lbl">This month</div>
            </div>
          </div>
        </div>

        {/* Hero text */}
        <div className="visual-hero">
          <h1>Your <span className="accent-text">transformation</span> starts here</h1>
          <p>Bahaa builds your plan, tracks your progress, and coaches you every step of the way.</p>
        </div>

        {/* Feature cards */}
        <div className="feature-grid">
          <div className="feature-card">
            <div className="fc-icon">🥗</div>
            <div className="fc-title">Nutrition Plan</div>
            <div className="fc-sub">Meal tracking</div>
          </div>
          <div className="feature-card">
            <div className="fc-icon">📅</div>
            <div className="fc-title">Weekly Sessions</div>
            <div className="fc-sub">Schedule overview</div>
          </div>
          <div className="feature-card">
            <div className="fc-icon">🤖</div>
            <div className="fc-title">AI Coach</div>
            <div className="fc-sub">Chat assistant</div>
          </div>
        </div>

        {/* Session preview */}
        <div className="session-preview">
          <div className="sp-dot"></div>
          <div className="sp-text">
            <b>Next Session:</b> Upper Body + Cardio
          </div>
          <div className="sp-time">Tomorrow 7:00 AM</div>
        </div>

      </div>
    </div>
  );
}