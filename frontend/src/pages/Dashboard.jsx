import { useEffect, useState } from "react";
import api from "../utils/api";

const POLL_INTERVAL = 3000;

const styles = `
  * {
    box-sizing: border-box;
  }

  .dashboard-page {
    min-height: 100vh;
    padding: 24px;
    background:
      radial-gradient(circle at top right, rgba(79, 134, 255, 0.18), transparent 22%),
      radial-gradient(circle at bottom left, rgba(46, 214, 115, 0.08), transparent 28%),
      linear-gradient(180deg, #09101f 0%, #0b1426 100%);
    color: #eef4ff;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .dashboard-frame {
    max-width: 1280px;
    margin: 0 auto;
    border-radius: 28px;
    overflow: hidden;
    background: rgba(15, 24, 48, 0.95);
    border: 1px solid rgba(132, 151, 198, 0.18);
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
  }

  .dashboard-header {
    padding: 28px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    background: rgba(35, 47, 76, 0.95);
    border-bottom: 1px solid rgba(132, 151, 198, 0.14);
    flex-wrap: wrap;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .brand-logo {
    width: 56px;
    height: 56px;
    display: grid;
    place-items: center;
    border-radius: 18px;
    background: linear-gradient(135deg, #5f9bff 0%, #3d78e5 100%);
    color: #fff;
    font-size: 30px;
    font-weight: 800;
    box-shadow: 0 12px 28px rgba(61, 120, 229, 0.28);
  }

  .brand h1 {
    margin: 0;
    font-size: 2rem;
    line-height: 1.05;
    letter-spacing: -0.04em;
  }

  .brand p {
    margin: 4px 0 0;
    color: #aebcdd;
    font-size: 0.96rem;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(18, 29, 56, 0.92);
    border: 1px solid rgba(132, 151, 198, 0.16);
    font-weight: 600;
    color: #dce7ff;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
  }

  .dot.online {
    background: #2ed673;
  }

  .dot.offline {
    background: #ff5b5b;
  }

  .updated-text {
    color: #aebcdd;
    font-size: 0.94rem;
  }

  .dashboard-main {
    padding: 32px;
  }

  .top-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.9fr);
    gap: 22px;
    margin-bottom: 28px;
  }

  .hero-card,
  .stat-card,
  .feedback-card,
  .level-block,
  .slot-card {
    background: linear-gradient(180deg, rgba(26, 39, 71, 0.96) 0%, rgba(18, 29, 56, 0.96) 100%);
    border: 1px solid rgba(132, 151, 198, 0.14);
    border-radius: 24px;
  }

  .hero-card {
    padding: 28px;
  }

  .hero-card span {
    display: inline-block;
    margin-bottom: 10px;
    color: #7ea8ff;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .hero-card h2 {
    margin: 0 0 12px;
    font-size: 2.2rem;
    line-height: 1.05;
    letter-spacing: -0.04em;
  }

  .hero-card p {
    margin: 0;
    color: #aebcdd;
    line-height: 1.7;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-card span {
    display: block;
    margin-bottom: 12px;
    color: #9caed2;
    font-size: 0.88rem;
  }

  .stat-card strong {
    display: block;
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  .stat-available {
    color: #39d675;
  }

  .stat-booked {
    color: #ffd24d;
  }

  .stat-occupied {
    color: #ff6b6b;
  }

  .feedback-card {
    padding: 22px;
    text-align: center;
    color: #dce7ff;
  }

  .feedback-card.error {
    background: rgba(64, 21, 30, 0.45);
    border-color: rgba(255, 91, 91, 0.34);
    color: #ffd2d2;
  }

  .warning-banner {
    margin-bottom: 22px;
    padding: 14px 16px;
    border-radius: 16px;
    border: 1px solid rgba(255, 145, 0, 0.28);
    background: rgba(107, 77, 6, 0.28);
    color: #ffe7ab;
    font-size: 0.95rem;
  }

  .level-block {
    padding: 24px;
    margin-top: 22px;
  }

  .level-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }

  .level-title h3 {
    margin: 0;
    font-size: 1.9rem;
    line-height: 1.08;
    letter-spacing: -0.04em;
  }

  .level-line {
    width: 170px;
    height: 4px;
    margin-top: 12px;
    border-radius: 999px;
    background: linear-gradient(90deg, #4f86ff 0%, #7aa0ff 100%);
  }

  .level-meta {
    color: #a6b6d9;
    font-size: 0.94rem;
  }

  .slots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 18px;
  }

  .slot-card {
    padding: 22px;
    min-height: 220px;
    border: 2px solid transparent;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 160ms ease, box-shadow 160ms ease;
  }

  .slot-card:hover {
    transform: translateY(-4px);
  }

  .slot-card.available {
    border-color: rgba(46, 214, 115, 0.9);
    box-shadow: 0 16px 40px rgba(25, 85, 51, 0.22);
  }

  .slot-card.booked {
    border-color: rgba(255, 210, 77, 0.95);
    box-shadow: 0 16px 40px rgba(118, 92, 22, 0.2);
  }

  .slot-card.occupied {
    border-color: rgba(255, 91, 91, 0.9);
    box-shadow: 0 16px 40px rgba(101, 32, 32, 0.22);
  }

  .slot-top {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .slot-top h4 {
    margin: 10px 0 0;
    font-size: 2.15rem;
    line-height: 1;
    letter-spacing: -0.04em;
  }

  .level-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 54px;
    padding: 9px 12px;
    border-radius: 999px;
    background: linear-gradient(135deg, #4d86ff 0%, #3d78e5 100%);
    color: #fff;
    font-size: 0.88rem;
    font-weight: 700;
  }

  .status-text {
    margin: 0 0 14px;
    font-size: 1.02rem;
    font-weight: 800;
    letter-spacing: 0.12em;
  }

  .status-text.available {
    color: #39d675;
  }

  .status-text.booked {
    color: #ffd24d;
  }

  .status-text.occupied {
    color: #ff6b6b;
  }

  .slot-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .slot-meta-item {
    padding: 14px;
    border-radius: 16px;
    background: rgba(13, 20, 39, 0.56);
    border: 1px solid rgba(132, 151, 198, 0.12);
  }

  .slot-meta-item span {
    display: block;
    margin-bottom: 6px;
    color: #93a4c7;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .slot-meta-item strong {
    display: block;
    color: #eff4ff;
    font-size: 1rem;
  }

  .slot-footer {
    margin-top: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 14px 16px;
    border-radius: 16px;
    color: #ffffff;
    font-size: 0.98rem;
    font-weight: 700;
    text-transform: capitalize;
  }

  .slot-footer.available {
    background: linear-gradient(135deg, #2fc966 0%, #24b95b 100%);
  }

  .slot-footer.booked {
    background: linear-gradient(135deg, #ffcf40 0%, #d7a400 100%);
    color: #1b1f29;
  }

  .slot-footer.occupied {
    background: linear-gradient(135deg, #ff5b5b 0%, #e34848 100%);
  }

  @media (max-width: 980px) {
    .dashboard-header {
      padding: 24px;
    }

    .dashboard-main {
      padding: 24px;
    }

    .top-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .dashboard-page {
      padding: 14px;
    }

    .hero-card,
    .stat-card,
    .level-block,
    .slot-card,
    .feedback-card {
      padding: 18px;
    }

    .brand h1 {
      font-size: 1.7rem;
    }

    .hero-card h2 {
      font-size: 1.8rem;
    }

    .stats-grid,
    .slot-meta-grid,
    .slots-grid {
      grid-template-columns: 1fr;
    }

    .slot-top h4 {
      font-size: 1.9rem;
    }
  }
`;

function normalizeStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === "occupied") return "occupied";
  if (normalized === "booked") return "booked";
  return "available";
}

function formatStatus(status) {
  const normalized = normalizeStatus(status);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getLevelLabel(level) {
  const numericLevel = Number(level);

  if (numericLevel === 1) return "Ground Floor";
  if (numericLevel === 2) return "Upper Floor";
  return "Parking Area";
}

export default function Dashboard() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchSlots = async (showLoader = false) => {
      if (showLoader && isMounted) {
        setLoading(true);
      }

      try {
        const res = await api.get("/api/slots");

        console.log("Dashboard API full response:", res);
        console.log("Dashboard API data:", res.data);

        if (!Array.isArray(res.data)) {
          throw new Error("Unexpected API response format. Expected an array.");
        }

        const normalizedSlots = res.data.map((slot) => ({
          ...slot,
          level: slot.level ?? 1,
          status: normalizeStatus(slot.status),
        }));

        console.log("Dashboard normalized slots:", normalizedSlots);

        if (!isMounted) return;

        setSlots(normalizedSlots);
        setError("");
        setIsOnline(true);
        setLastUpdated(
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      } catch (err) {
        console.error("Dashboard fetch error:", err);

        if (!isMounted) return;

        setIsOnline(false);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load parking slots."
        );
      } finally {
        if (showLoader && isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSlots(true);

    const intervalId = window.setInterval(() => {
      fetchSlots(false);
    }, POLL_INTERVAL);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const sortedSlots = [...slots].sort((a, b) => {
    const levelDiff = Number(a.level ?? 0) - Number(b.level ?? 0);

    if (levelDiff !== 0) {
      return levelDiff;
    }

    return String(a.slot_number ?? "").localeCompare(
      String(b.slot_number ?? ""),
      undefined,
      { numeric: true, sensitivity: "base" }
    );
  });

  const groupedSlots = sortedSlots.reduce((acc, slot) => {
    const levelKey = String(slot.level ?? 1);

    if (!acc[levelKey]) {
      acc[levelKey] = [];
    }

    acc[levelKey].push(slot);
    return acc;
  }, {});

  const levelEntries = Object.entries(groupedSlots).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  const totalSlots = sortedSlots.length;
  const availableCount = sortedSlots.filter((slot) => slot.status === "available").length;
  const bookedCount = sortedSlots.filter((slot) => slot.status === "booked").length;
  const occupiedCount = sortedSlots.filter((slot) => slot.status === "occupied").length;

  return (
    <>
      <style>{styles}</style>

      <div className="dashboard-page">
        <div className="dashboard-frame">
          <header className="dashboard-header">
            <div className="brand">
              <div className="brand-logo">P</div>

              <div>
                <h1>Smart Parking</h1>
                <p>Live RFID + IR parking monitor</p>
              </div>
            </div>

            <div className="header-right">
              <div className="pill">
                <span className={`dot ${isOnline ? "online" : "offline"}`} />
                {isOnline ? "System Online" : "System Offline"}
              </div>

              <div className="updated-text">
                {lastUpdated ? `Last updated at ${lastUpdated}` : "Waiting for live data..."}
              </div>
            </div>
          </header>

          <main className="dashboard-main">
            <section className="top-grid">
              <div className="hero-card">
                <span>Smart Parking Dashboard</span>
                <h2>Track booked, occupied, and available slots in real time.</h2>
                <p>
                  This dashboard reads directly from <strong>/api/slots</strong>,
                  uses <strong>res.data</strong> as the array response, and refreshes
                  every 3 seconds so ESP-triggered IR updates appear automatically.
                </p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <span>Total Slots</span>
                  <strong>{totalSlots}</strong>
                </div>

                <div className="stat-card">
                  <span>Available</span>
                  <strong className="stat-available">{availableCount}</strong>
                </div>

                <div className="stat-card">
                  <span>Booked</span>
                  <strong className="stat-booked">{bookedCount}</strong>
                </div>

                <div className="stat-card">
                  <span>Occupied</span>
                  <strong className="stat-occupied">{occupiedCount}</strong>
                </div>
              </div>
            </section>

            {error && sortedSlots.length > 0 ? (
              <div className="warning-banner">
                Live refresh failed, but the last known slot state is still displayed. Error: {error}
              </div>
            ) : null}

            {loading ? (
              <div className="feedback-card">Loading parking slots...</div>
            ) : error && sortedSlots.length === 0 ? (
              <div className="feedback-card error">{error}</div>
            ) : sortedSlots.length === 0 ? (
              <div className="feedback-card">No parking slots found.</div>
            ) : (
              levelEntries.map(([level, levelSlots]) => (
                <section className="level-block" key={level}>
                  <div className="level-header">
                    <div className="level-title">
                      <h3>
                        Level {level} - {getLevelLabel(level)}
                      </h3>
                      <div className="level-line" />
                    </div>

                    <div className="level-meta">
                      {levelSlots.length} slot{levelSlots.length === 1 ? "" : "s"}
                    </div>
                  </div>

                  <div className="slots-grid">
                    {levelSlots.map((slot) => (
                      <article
                        key={slot.id}
                        className={`slot-card ${slot.status}`}
                      >
                        <div>
                          <div className="slot-top">
                            <div>
                              <div className="level-badge">L{slot.level}</div>
                              <h4>{slot.slot_number}</h4>
                            </div>
                          </div>

                          <p className={`status-text ${slot.status}`}>
                            {formatStatus(slot.status).toUpperCase()}
                          </p>

                          <div className="slot-meta-grid">
                            <div className="slot-meta-item">
                              <span>Slot ID</span>
                              <strong>#{slot.id}</strong>
                            </div>

                            <div className="slot-meta-item">
                              <span>Level</span>
                              <strong>{slot.level}</strong>
                            </div>
                          </div>
                        </div>

                        <div className={`slot-footer ${slot.status}`}>
                          {slot.slot_number} - {formatStatus(slot.status)}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))
            )}
          </main>
        </div>
      </div>
    </>
  );
}
