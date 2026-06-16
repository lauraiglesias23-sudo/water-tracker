import { useState, useEffect, useCallback } from "react";

const TODAY = () => new Date().toISOString().slice(0, 10);
const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

function WaterDrop({ filled, size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z"
        fill={filled ? "#2196F3" : "#DBEAFE"}
        stroke={filled ? "#1565C0" : "#93C5FD"}
        strokeWidth="1"
      />
    </svg>
  );
}

function RingProgress({ value, max, size = 200 }) {
  const radius = 80;
  const stroke = 14;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const pct = Math.min(value / max, 1);
  const strokeDashoffset = circumference - pct * circumference;

  return (
    <svg width={size} height={size} viewBox="0 0 160 160">
      <circle cx="80" cy="80" r={normalizedRadius} fill="none" stroke="#DBEAFE" strokeWidth={stroke} />
      <circle
        cx="80" cy="80" r={normalizedRadius} fill="none"
        stroke={pct >= 1 ? "#22C55E" : "#2196F3"}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform="rotate(-90 80 80)"
        style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.3s ease" }}
      />
      <text x="80" y="68" textAnchor="middle" fontSize="36" fontWeight="700"
        fill={pct >= 1 ? "#16A34A" : "#1565C0"} fontFamily="system-ui, sans-serif">{value}</text>
      <text x="80" y="88" textAnchor="middle" fontSize="13" fill="#64748B" fontFamily="system-ui, sans-serif">
        de {max} vasos
      </text>
      <text x="80" y="106" textAnchor="middle" fontSize="11" fill="#94A3B8" fontFamily="system-ui, sans-serif">
        {pct >= 1 ? "¡Meta alcanzada! 🎉" : `${max - value} restantes`}
      </text>
    </svg>
  );
}

export default function WaterTracker() {
  const [goal, setGoal] = useState(8);
  const [history, setHistory] = useState({});
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [tempGoal, setTempGoal] = useState(8);
  const [ripple, setRipple] = useState(false);

  const today = TODAY();
  const todayCount = history[today] || 0;

  useEffect(() => {
    try {
      const h = localStorage.getItem("water-history");
      const g = localStorage.getItem("water-goal");
      if (h) setHistory(JSON.parse(h));
      if (g) { setGoal(parseInt(g)); setTempGoal(parseInt(g)); }
    } catch (_) {}
  }, []);

  const saveHistory = useCallback((newHistory) => {
    try { localStorage.setItem("water-history", JSON.stringify(newHistory)); } catch (_) {}
  }, []);

  const saveGoal = useCallback((g) => {
    try { localStorage.setItem("water-goal", String(g)); } catch (_) {}
  }, []);

  const addGlass = () => {
    setRipple(true);
    setTimeout(() => setRipple(false), 350);
    setHistory(prev => {
      const next = { ...prev, [today]: (prev[today] || 0) + 1 };
      saveHistory(next);
      return next;
    });
  };

  const removeGlass = () => {
    if (todayCount === 0) return;
    setHistory(prev => {
      const next = { ...prev, [today]: Math.max(0, (prev[today] || 0) - 1) };
      saveHistory(next);
      return next;
    });
  };

  const applyGoal = () => {
    const g = Math.max(1, Math.min(20, tempGoal));
    setGoal(g); saveGoal(g); setShowGoalEdit(false);
  };

  const last7 = getLast7Days();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #E3F2FD 0%, #F0F9FF 60%, #EFF6FF 100%)",
      fontFamily: "'system-ui', '-apple-system', sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "0 0 40px 0", maxWidth: 430, margin: "0 auto",
    }}>
      <div style={{
        width: "100%",
        background: "linear-gradient(135deg, #1565C0 0%, #2196F3 100%)",
        padding: "20px 24px 24px",
        borderRadius: "0 0 28px 28px",
        boxShadow: "0 4px 20px rgba(33,150,243,0.25)",
        boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase" }}>Hidratación Diaria</div>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginTop: 2 }}>
              {new Date().toLocaleDateString("es-AR", { weekday: "long", month: "short", day: "numeric" })}
            </div>
          </div>
          <button onClick={() => { setTempGoal(goal); setShowGoalEdit(true); }}
            style={{
              background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 12, color: "#fff", fontSize: 12, padding: "6px 12px", cursor: "pointer", fontWeight: 600,
            }}>Meta: {goal} 💧</button>
        </div>
      </div>

      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <RingProgress value={todayCount} max={goal} size={200} />
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, maxWidth: 280, marginTop: 12 }}>
          {Array.from({ length: goal }, (_, i) => <WaterDrop key={i} filled={i < todayCount} size={26} />)}
        </div>
      </div>

      <div style={{ marginTop: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <button onClick={addGlass} style={{
          width: 160, height: 160, borderRadius: "50%",
          background: ripple ? "linear-gradient(135deg, #1565C0 0%, #1976D2 100%)" : "linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)",
          border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          boxShadow: ripple ? "0 2px 12px rgba(33,150,243,0.4)" : "0 8px 32px rgba(33,150,243,0.45)",
          transform: ripple ? "scale(0.94)" : "scale(1)", transition: "all 0.18s ease", WebkitTapHighlightColor: "transparent",
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z" fill="rgba(255,255,255,0.9)" />
            <path d="M12 8v8M8 12h8" stroke="rgba(33,150,243,0.8)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginTop: 6 }}>Agregar vaso</span>
        </button>
        <button onClick={removeGlass} disabled={todayCount === 0} style={{
          background: "none", border: "1px solid #BFDBFE", borderRadius: 20,
          color: todayCount === 0 ? "#CBD5E1" : "#64748B", fontSize: 13, padding: "7px 20px",
          cursor: todayCount === 0 ? "default" : "pointer", fontWeight: 500,
        }}>− Quitar último</button>
      </div>

      <div style={{
        width: "calc(100% - 32px)", background: "#fff", borderRadius: 20,
        padding: "20px 16px", marginTop: 32, boxShadow: "0 2px 16px rgba(30,80,160,0.08)", boxSizing: "border-box",
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1E3A5F", marginBottom: 14, letterSpacing: 0.5 }}>ÚLTIMOS 7 DÍAS</div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
          {last7.map(date => {
            const count = history[date] || 0;
            const hit = count >= goal;
            const isToday = date === today;
            const dayName = DAYS[new Date(date + "T12:00:00").getDay()];
            const dayNum = parseInt(date.slice(8));
            const barH = Math.min(Math.round((count / goal) * 52), 52);
            return (
              <div key={date} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 4 }}>
                <div style={{ position: "relative", width: "100%", height: 56, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                  <div style={{ width: "70%", height: 52, background: "#F1F5F9", borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
                    <div style={{
                      width: "100%", height: barH || 0,
                      background: hit ? "linear-gradient(to top, #16A34A, #4ADE80)" : "linear-gradient(to top, #2196F3, #90CAF9)",
                      borderRadius: 8, transition: "height 0.3s ease",
                    }} />
                  </div>
                  {hit && <div style={{ position: "absolute", top: -2, fontSize: 12 }}>✓</div>}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: hit ? "#16A34A" : "#2196F3" }}>{count}</div>
                <div style={{ fontSize: 10, color: isToday ? "#1565C0" : "#94A3B8", fontWeight: isToday ? 700 : 400 }}>
                  {isToday ? "Hoy" : dayName}
                </div>
                <div style={{ fontSize: 10, color: isToday ? "#1565C0" : "#CBD5E1" }}>{dayNum}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 14, justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: "linear-gradient(to top, #2196F3, #90CAF9)" }} />
            <span style={{ fontSize: 11, color: "#94A3B8" }}>En progreso</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: "linear-gradient(to top, #16A34A, #4ADE80)" }} />
            <span style={{ fontSize: 11, color: "#94A3B8" }}>Meta cumplida</span>
          </div>
        </div>
      </div>

      {showGoalEdit && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }} onClick={(e) => { if (e.target === e.currentTarget) setShowGoalEdit(false); }}>
          <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 430, boxSizing: "border-box" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1E3A5F", marginBottom: 6 }}>Meta diaria</div>
            <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 24 }}>¿Cuántos vasos de agua por día?</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginBottom: 28 }}>
              <button onClick={() => setTempGoal(g => Math.max(1, g - 1))}
                style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid #BFDBFE", background: "#EFF6FF", fontSize: 22, cursor: "pointer", color: "#2196F3", fontWeight: 700 }}>−</button>
              <div style={{ fontSize: 48, fontWeight: 800, color: "#1565C0", minWidth: 72, textAlign: "center" }}>{tempGoal}</div>
              <button onClick={() => setTempGoal(g => Math.min(20, g + 1))}
                style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid #BFDBFE", background: "#EFF6FF", fontSize: 22, cursor: "pointer", color: "#2196F3", fontWeight: 700 }}>+</button>
            </div>
            <button onClick={applyGoal} style={{
              width: "100%", padding: "16px", borderRadius: 16,
              background: "linear-gradient(135deg, #2196F3, #1565C0)",
              border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
            }}>Guardar meta</button>
          </div>
        </div>
      )}
    </div>
  );
}
