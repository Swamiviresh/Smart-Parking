import { useEffect, useState } from "react";
import api from "../utils/api";

const POLL_INTERVAL = 4000;

const styles = `
  * {
    box-sizing: border-box;
  }

  .dashboard-shell {
    min-height: 100vh;
    padding: 24px;
    background:
      radial-gradient(circle at top right, rgba(77, 127, 255, 0.18), transparent 24%),
      radial-gradient(circle at bottom left, rgba(46, 214, 115, 0.08), transparent 28%),
      linear-gradient(180deg, #0b1329 0%, #0a1020 100%);
    color: #eef4ff;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .dashboard-frame {
    max-width: 1280px;
    margin: 0 auto;
    background: rgba(15, 24, 48, 0.92);
    border: 1px solid rgba(132, 151, 198, 0.18);
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
  }

  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 28px 32px;
    background: rgba(35, 47, 76, 0.95);
    border-bottom: 1px solid rgba(132, 151, 198, 0.14);
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
    color: #ffffff;
    font-size: 30px;
    font-weight: 800;
    box-shadow: 0 12px 30px rgba(61, 120, 229, 0.28);
  }

  .brand h1 {
    margin: 0;
    font-size: 2rem;
    line-height: 1.1;
    letter-spacing: -0.03em;
  }

  .brand p {
    margin: 4px 0 0;
    color: #aebcdd;
    font-size: 0.96rem;
  }

  .header-meta {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .system-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(18, 29, 56, 0.92);
    border: 1px solid rgba(132, 151, 198, 0.18);
    color: #d9e5ff;
    font-weight: 600;
  }

  .system-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.04);
  }

  .system-dot.online {
    background: #2ed673;
  }

  .system-dot.offline {
    background: #ff5b5b;
  }

  .updated-text {
    color: #aebcdd;
    font-size: 0.94rem;
  }

  .dashboard-main {
    padding: 32px;
  }

  .hero {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.9fr);
    gap: 24px;
    margin-bottom: 28px;
  }

  .hero-copy {
    padding: 28px;
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(26, 39, 71, 0.96) 0%, rgba(18, 29, 56, 0.96) 100%);
    border: 1px solid rgba(132, 151, 198, 0.14);
  }

  .hero-copy span {
    display: inline-block;
    margin-bottom: 10px;
    color: #7ea8ff;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .hero-copy h2 {
    margin: 0 0 12px;
    font-size: 2.2rem;
    line-height: 1.05;
    letter-spacing: -0.04em;
  }

  .hero-copy p {
    margin: 0;
    max-width: 58ch;
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
    border-radius: 20px;
    background: linear-gradient(180deg, rgba(26, 39, 71, 0.94) 0%, rgba(18, 29, 56, 0.94) 100%);
    border: 1px solid rgba(132, 151, 198, 0.14);
  }

  .stat-card-label {
    display: block;
    margin-bottom: 12px;
    color: #9caed2;
    font-size: 0.88rem;
  }

  .stat-card-value {
    margin: 0;
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  .stat-card-value.available {
    color: #39d675;
  }

  .stat-card-value.booked {
    color: #ff6b6b;
  }

  .stat-card-value.online {
    color: #8cc1ff;
    font-size: 1.2rem;
    letter-spacing: 0;
  }

  .feedback-card {
    padding: 22px;
    border-radius: 20px;
    background: rgba(18, 29, 56, 0.95);
    border: 1px solid rgba(132, 151, 198, 0.14);
    color: #dce7ff;
    text-align: center;
  }

  .feedback-card.error {
    border-color: rgba(255, 91, 91, 0.34);
    color: #ffd2d2;
    background: rgba(64, 21, 30, 0.45);
  }

  .warning-banner {
    margin-bottom: 22px;
    padding: 14px 16px;
    border-radius: 16px;
    border: 1px solid rgba(255, 91, 91, 0.32);
    background: rgba(92, 26, 41, 0.28);
    color: #ffd6d6;
    font-size: 0.96rem;
  }

  .level-section + .level-section {
    margin-top: 34px;
  }

  .section-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }

  .section-title-wrap h3 {
    margin: 0;
    font-size: 2rem;
    line-height: 1.08;
    letter-spacing: -0.04em;
  }

  .section-title-wrap .section-line {
    width: 180px;
    height: 4px;
    margin-top: 12px;
    border-radius: 999px;
    background: linear-gradient(90deg, #4f86ff 0%, #7aa0ff 100%);
  }

  .section-meta {
    color: #9fb0d3;
    font-size: 0.95rem;
  }

  .slots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
  }

  .slot-card {
    padding: 22px;
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(33, 45, 72, 0.97) 0%, rgba(25, 35, 60, 0.97) 100%);
    border: 2px solid transparent;
    min-height: 260px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
  }

  .slot-card:hover {
    transform: translateY(-4px);
  }

  .slot-card.available {
    border-color: rgba(46, 214, 115, 0.9);
    box-shadow: 0 18px 40px rgba(25, 85, 51, 0.22);
  }

  .slot-card.booked {
    border-color: rgba(255, 91, 91, 0.9);
    box-shadow: 0 18px 40px rgba(101, 32, 32, 0.22);
  }

  .slot-top {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .slot-top h4 {
    margin: 14px 0 0;
    font-size: 2.25rem;
    line-height: 1;
    letter-spacing: -0.04em;
  }

  .slot-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 54px;
    padding: 9px 12px;
    border-radius: 999px;
    background: linear-gradient(135deg, #4d86ff 0%, #3d78e5 100%);
    color: #ffffff;
    font-size: 0.88rem;
    font-weight: 700;
  }

  .slot-status {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 800;
    letter-spacing: 0.12em;
  }

  .slot-status.available {
    color: #39d675;
  }

  .slot-status.booked {
    color: #ff6b6b;
  }

  .slot-divider {
    height: 1px;
    margin: 18px 0;
    background: rgba(132, 151, 198, 0.18);
  }

  .slot-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 18px;
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
    background: linear-gradient(135deg, #ff5b5b 0%, #e34848 100%);
  }

  @media (max-width: 980px) {
    .dashboard-header {
      padding: 24px;
      flex-direction: column;
      align-items: flex-start;
    }

    .header-meta {
      width: 100%;
      justify-content: flex-start;
    }

    .dashboard-main {
      padding: 24px;
    }

    .hero {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .dashboard-shell {
      padding: 14px;
    }

    .brand h1 {
      font-size: 1.7rem;
    }

    .hero-copy,
    .stat-card,
    .slot-card,
    .feedback-card {
      padding: 18px;
    }

    .hero-copy h2 {
      font-size: 1.8rem;
    }

    .section-title-wrap h3 {
      font-size: 1.6rem;
    }

    .stats-grid,
    .slot-meta-grid {
      grid-template-columns: 1fr;
    }

    .slots-grid {
      grid-template-columns: 1fr;
    }

    .slot-top h4 {
      font-size: 1.9rem;
    }
  }
`;

const normalizeStatus = (status) => String(status || "").trim().toLowerCase();

const formatStatus = (status) => {
  const normalized = normalizeStatus(status);
  if (!normalized) return "Unknown";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getLevelLabel = (level) => {
  const numericLevel = Number(level);
  if (numericLevel === 1) return "Ground Floor";
  if (numericLevel === 2) return "Upper Floor";
  return "Parking Area";
};

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

        console.log("Dashboard API response:", res);
        console.log("Dashboard API data:", res.data);

        if (!Array.isArray(res.data)) {
          throw new Error("Unexpected API response format. Expected an array.");
        }

        const normalizedSlots = res.data.map((slot) => ({
          ...slot,
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
    if (levelDiff !== 0) return levelDiff;

    return String(a.slot_number ?? "").localeCompare(
      String(b.slot_number ?? ""),
      undefined,
      { numeric: true, sensitivity: "base" }
    );
  });

  const groupedByLevel = sortedSlots.reduce((acc, slot) => {
    const key = slot.level ?? "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(slot);
    return acc;
  }, {});

  const levelEntries = Object.entries(groupedByLevel).sort(
    ([levelA], [levelB]) => Number(levelA) - Number(levelB)
  );

  const totalSlots = sortedSlots.length;
  const availableSlots = sortedSlots.filter(
    (slot) => normalizeStatus(slot.status) === "available"
  ).length;
  const bookedSlots = totalSlots - availableSlots;

  return (
    <>
      <style>{styles}</style>

      <div className="dashboard-shell">
        <div className="dashboard-frame">
          <header className="dashboard-header">
            <div className="brand">
              <div className="brand-logo">P</div>

              <div>
                <h1>Smart Parking</h1>
                <p>ESP-synced parking slot monitor</p>
              </div>
            </div>

            <div className="header-meta">
              <div className="system-pill">
                <span
                  className={`system-dot ${isOnline ? "online" : "offline"}`}
                />
                {isOnline ? "System Online" : "System Offline"}
              </div>

              <div className="updated-text">
                {lastUpdated
                  ? `Last updated at ${lastUpdated}`
                  : "Waiting for first sync..."}
              </div>
            </div>
          </header>

          <main className="dashboard-main">
            <section className="hero">
              <div className="hero-copy">
                <span>Live Dashboard</span>
                <h2>Track every parking slot in real time.</h2>
                <p>
                  Slot status is fetched from <strong>/api/slots</strong> and
                  refreshed automatically every 4 seconds, so changes pushed by
                  your ESP device show up without reloading the page.
                </p>
              </div>

              <div className="stats-grid">
                <article className="stat-card">
                  <span className="stat-card-label">Total Slots</span>
                  <p className="stat-card-value">{totalSlots}</p>
                </article>

                <article className="stat-card">
                  <span className="stat-card-label">Available</span>
                  <p className="stat-card-value available">{availableSlots}</p>
                </article>

                <article className="stat-card">
                  <span className="stat-card-label">Booked</span>
                  <p className="stat-card-value booked">{bookedSlots}</p>
                </article>

                <article className="stat-card">
                  <span className="stat-card-label">Live Status</span>
                  <p className="stat-card-value online">
                    {isOnline ? "Polling Active" : "Reconnect Needed"}
                  </p>
                </article>
              </div>
            </section>

            {error && sortedSlots.length > 0 ? (
              <div className="warning-banner">
                Live refresh hit an error, but the last known slot data is still
                shown. Error: {error}
              </div>
            ) : null}

            {loading ? (
              <div className="feedback-card">Loading parking slots...</div>
            ) : error && sortedSlots.length === 0 ? (
              <div className="feedback-card error">{error}</div>
            ) : sortedSlots.length === 0 ? (
              <div className="feedback-card">
                No parking slots found right now.
              </div>
            ) : (
              levelEntries.map(([level, levelSlots]) => (
                <section className="level-section" key={level}>
                  <div className="section-header">
                    <div className="section-title-wrap">
                      <h3>
                        Level {level} {"\u2014"} {getLevelLabel(level)}
                      </h3>
                      <div className="section-line" />
                    </div>

                    <div className="section-meta">
                      {levelSlots.length} slot
                      {levelSlots.length === 1 ? "" : "s"} on this level
                    </div>
                  </div>

                  <div className="slots-grid">
                    {levelSlots.map((slot) => {
                      const isAvailable =
                        normalizeStatus(slot.status) === "available";

                      return (
                        <article
                          key={slot.id}
                          className={`slot-card ${
                            isAvailable ? "available" : "booked"
                          }`}
                        >
                          <div>
                            <div className="slot-top">
                              <div>
                                <span className="slot-badge">
                                  L{slot.level ?? "-"}
                                </span>
                                <h4>{slot.slot_number}</h4>
                              </div>
                            </div>

                            <p
                              className={`slot-status ${
                                isAvailable ? "available" : "booked"
                              }`}
                            >
                              {formatStatus(slot.status).toUpperCase()}
                            </p>

                            <div className="slot-divider" />

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

                          <div
                            className={`slot-footer ${
                              isAvailable ? "available" : "booked"
                            }`}
                          >
                            {slot.slot_number} - {formatStatus(slot.status)}
                          </div>
                        </article>
                      );
                    })}
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
