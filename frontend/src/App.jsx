
import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://wind-forecast-dashboard-9ha5.onrender.com";

function App() {
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-01-31");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard(event) {
    if (event) {
      event.preventDefault();
    }

    if (startDate > endDate) {
      setError("The start date must be before or equal to the end date.");
      setDashboard(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url =
        `${API_BASE_URL}/api/metrics` +
        `?start_date=${encodeURIComponent(startDate)}` +
        `&end_date=${encodeURIComponent(endDate)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}.`);
      }

      const data = await response.json();

      if (!data || typeof data !== "object") {
        throw new Error("The backend returned an invalid response.");
      }

      setDashboard(data);
    } catch (err) {
      console.error("Dashboard request failed:", err);
      setDashboard(null);
      setError(
        "Failed to fetch data. Please check the backend connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const metrics = dashboard?.metrics || {};
  const comparisons = Array.isArray(dashboard?.comparisons)
    ? dashboard.comparisons
    : [];

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f3f6fb",
      color: "#18181b",
      fontFamily: "Arial, Helvetica, sans-serif",
      padding: "24px 16px 36px",
      boxSizing: "border-box",
    },
    container: {
      maxWidth: "1000px",
      margin: "0 auto",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "12px",
      marginBottom: "30px",
    },
    heading: {
      fontSize: "clamp(27px, 5vw, 42px)",
      margin: "0 0 6px",
      fontWeight: 700,
    },
    subtitle: {
      color: "#64748b",
      margin: 0,
      fontSize: "16px",
    },
    badge: {
      background: "#d1fae5",
      color: "#047857",
      borderRadius: "30px",
      padding: "13px 18px",
      fontWeight: 600,
      fontSize: "14px",
    },
    panel: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "24px",
    },
    form: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "end",
      gap: "16px",
    },
    field: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      flex: "1 1 170px",
    },
    label: {
      fontSize: "14px",
      fontWeight: 600,
      color: "#475569",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "14px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "10px",
      fontSize: "15px",
      background: "#ffffff",
    },
    button: {
      background: "#059669",
      color: "#ffffff",
      border: "none",
      borderRadius: "10px",
      padding: "14px 22px",
      fontSize: "16px",
      fontWeight: 700,
      cursor: "pointer",
    },
    error: {
      background: "#fee2e2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
      padding: "16px",
      borderRadius: "10px",
      textAlign: "center",
      marginBottom: "24px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "16px",
      marginBottom: "24px",
    },
    metricCard: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "14px",
      padding: "22px",
    },
    metricTitle: {
      color: "#64748b",
      fontSize: "14px",
      margin: "0 0 12px",
    },
    metricValue: {
      fontSize: "28px",
      fontWeight: 700,
      margin: 0,
      overflowWrap: "anywhere",
    },
    sectionTitle: {
      fontSize: "21px",
      margin: "0 0 18px",
    },
    tableWrap: {
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "14px",
    },
    cell: {
      padding: "13px 12px",
      textAlign: "left",
      borderBottom: "1px solid #e5e7eb",
      whiteSpace: "nowrap",
    },
    footer: {
      textAlign: "center",
      color: "#64748b",
      fontSize: "13px",
      marginTop: "40px",
    },
  };

  function formatNumber(value) {
    const number = Number(value);

    return Number.isFinite(number)
      ? number.toLocaleString("en-GB", {
          maximumFractionDigits: 2,
        })
      : "N/A";
  }

  function formatTime(value) {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return String(value);

    return (
      date.toISOString().replace("T", " ").slice(0, 16) + " UTC"
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.heading}>UK Wind Forecast Dashboard</h1>
            <p style={styles.subtitle}>
              Day-ahead forecast accuracy and actual wind generation
            </p>
          </div>

          <span style={styles.badge}>● Wind Energy</span>
        </header>

        <section style={styles.panel}>
          <form style={styles.form} onSubmit={loadDashboard}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="start-date">
                Start date
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label} htmlFor="end-date">
                End date
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                style={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
              }}
              disabled={loading}
            >
              {loading ? "Loading..." : "Load Dashboard"}
            </button>
          </form>
        </section>

        {error && (
          <div style={styles.error} role="alert">
            {error}
          </div>
        )}

        {loading && !dashboard && (
          <p style={{ textAlign: "center", color: "#64748b" }}>
            Loading wind generation data...
          </p>
        )}

        {dashboard && (
          <>
            <section style={styles.grid}>
              <article style={styles.metricCard}>
                <p style={styles.metricTitle}>Matched Records</p>
                <p style={styles.metricValue}>
                  {formatNumber(dashboard.matched_records)}
                </p>
              </article>

              <article style={styles.metricCard}>
                <p style={styles.metricTitle}>Mean Absolute Error (MAE)</p>
                <p style={styles.metricValue}>
                  {formatNumber(metrics.MAE)}
                </p>
              </article>

              <article style={styles.metricCard}>
                <p style={styles.metricTitle}>Root Mean Squared Error (RMSE)</p>
                <p style={styles.metricValue}>
                  {formatNumber(metrics.RMSE)}
                </p>
              </article>

              <article style={styles.metricCard}>
                <p style={styles.metricTitle}>Forecast Bias</p>
                <p style={styles.metricValue}>
                  {formatNumber(metrics.Bias)}
                </p>
              </article>
            </section>

            {dashboard.bias_interpretation && (
              <section style={styles.panel}>
                <h2 style={styles.sectionTitle}>Forecast Interpretation</h2>
                <p>{dashboard.bias_interpretation}</p>
              </section>
            )}

            <section style={styles.panel}>
              <h2 style={styles.sectionTitle}>Forecast vs Actual Generation</h2>

              {comparisons.length === 0 ? (
                <p>
                  No matched forecast and actual records are available
                  for the selected dates.
                </p>
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.cell}>Time (UTC)</th>
                        <th style={styles.cell}>Forecast</th>
                        <th style={styles.cell}>Actual</th>
                        <th style={styles.cell}>Forecast Error</th>
                      </tr>
                    </thead>

                    <tbody>
                      {comparisons.map((item, index) => (
                        <tr key={item.startTime || index}>
                          <td style={styles.cell}>
                            {formatTime(item.startTime)}
                          </td>
                          <td style={styles.cell}>
                            {formatNumber(item.forecast_generation)}
                          </td>
                          <td style={styles.cell}>
                            {formatNumber(item.actual_hourly_average)}
                          </td>
                          <td style={styles.cell}>
                            {formatNumber(
                              item.error_forecast_minus_actual
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <p style={styles.subtitle}>
              Data source: {dashboard.data_source || "Elexon BMRS"}
              {" · "}
              Period: {dashboard.start_date} to {dashboard.end_date}
              {" · "}
              Times shown in UTC
            </p>
          </>
        )}

        <footer style={styles.footer}>
          Data from Elexon BMRS · Times shown in UTC
        </footer>
      </div>
    </main>
  );
}

export default App;
