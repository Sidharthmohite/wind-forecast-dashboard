import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  "https://wind-forecast-dashboard-9ha5.onrender.com";

function formatDateForAPI(date) {
  const match = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    throw new Error("Enter the date in DD/MM/YYYY format.");
  }

  const [, day, month, year] = match;
  const parsed = new Date(`${year}-${month}-${day}T00:00:00Z`);

  if (
    parsed.getUTCFullYear() !== Number(year) ||
    parsed.getUTCMonth() + 1 !== Number(month) ||
    parsed.getUTCDate() !== Number(day)
  ) {
    throw new Error("Enter a valid calendar date.");
  }

  return `${year}-${month}-${day}`;
}

function App() {
  const [startDate, setStartDate] = useState("01/01/2026");
  const [endDate, setEndDate] = useState("31/01/2026");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchMetrics(start, end) {
    setLoading(true);
    setError("");

    try {
      const startISO = formatDateForAPI(start);
      const endISO = formatDateForAPI(end);

      if (startISO > endISO) {
        throw new Error(
          "Start date must be before or equal to end date."
        );
      }

      const params = new URLSearchParams({
        start_date: startISO,
        end_date: endISO,
      });

      const response = await fetch(
        `${API_URL}/api/metrics?${params.toString()}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Unable to fetch dashboard metrics."
        );
      }

      setData(result);
    } catch (err) {
      setData(null);
      setError(err.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMetrics("01/01/2026", "31/01/2026");
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    fetchMetrics(startDate, endDate);
  }

  const metrics = data?.metrics;

  const styles = {
    page: {
      minHeight: "100vh",
      padding: "32px 20px",
      background: "#f4f7fb",
      color: "#18181b",
      fontFamily: "Arial, sans-serif",
    },
    container: {
      maxWidth: "1100px",
      margin: "0 auto",
    },
    panel: {
      background: "#ffffff",
      borderRadius: "14px",
      padding: "24px",
      marginBottom: "22px",
      boxShadow: "0 3px 14px rgba(0,0,0,0.06)",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "600",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "12px",
      border: "1px solid #d4d4d8",
      borderRadius: "8px",
      fontSize: "15px",
    },
    button: {
      padding: "12px 22px",
      background: "#059669",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
    },
    card: {
      background: "#ffffff",
      padding: "22px",
      borderRadius: "12px",
      boxShadow: "0 3px 14px rgba(0,0,0,0.05)",
    },
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={{ marginBottom: "28px" }}>
          <h1>UK Wind Forecast Dashboard</h1>
          <p>
            Monitor wind generation forecast accuracy using
            actual generation data.
          </p>
        </header>

        <section style={styles.panel}>
          <h2>Date Range</h2>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "18px",
                alignItems: "end",
              }}
            >
              <div>
                <label style={styles.label} htmlFor="startDate">
                  Start Date
                </label>

                <input
                  id="startDate"
                  type="text"
                  inputMode="numeric"
                  placeholder="DD/MM/YYYY"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                  style={styles.input}
                  required
                  pattern="(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/[0-9]{4}"
                  title="Enter date in DD/MM/YYYY format"
                />
              </div>

              <div>
                <label style={styles.label} htmlFor="endDate">
                  End Date
                </label>

                <input
                  id="endDate"
                  type="text"
                  inputMode="numeric"
                  placeholder="DD/MM/YYYY"
                  value={endDate}
                  onChange={(event) =>
                    setEndDate(event.target.value)
                  }
                  style={styles.input}
                  required
                  pattern="(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/[0-9]{4}"
                  title="Enter date in DD/MM/YYYY format"
                />
              </div>

              <button
                type="submit"
                style={styles.button}
                disabled={loading}
              >
                {loading ? "Loading..." : "Apply Filters"}
              </button>
            </div>
          </form>
        </section>

        {error && (
          <div
            role="alert"
            style={{
              ...styles.panel,
              color: "#b91c1c",
              border: "1px solid #fecaca",
            }}
          >
            <strong>Unable to load dashboard</strong>
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <p role="status">Loading wind generation metrics...</p>
        )}

        {!loading && metrics && (
          <>
            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "18px",
                marginBottom: "22px",
              }}
            >
              <div style={styles.card}>
                <p>Mean Absolute Error (MAE)</p>
                <h2>{metrics.MAE ?? "N/A"}</h2>
              </div>

              <div style={styles.card}>
                <p>Root Mean Square Error (RMSE)</p>
                <h2>{metrics.RMSE ?? "N/A"}</h2>
              </div>

              <div style={styles.card}>
                <p>Forecast Bias</p>
                <h2>{metrics.Bias ?? "N/A"}</h2>
              </div>
            </section>

            <section style={styles.panel}>
              <h2>Forecast Accuracy Summary</h2>

              <p>
                <strong>Selected period:</strong>{" "}
                {data.start_date} to {data.end_date}
              </p>

              <p>
                <strong>Matched records:</strong>{" "}
                {data.matched_records}
              </p>

              <p>
                <strong>Data source:</strong>{" "}
                {data.data_source}
              </p>

              <p>{data.bias_interpretation}</p>
            </section>

            <section style={styles.panel}>
              <h2>Forecast vs Actual Records</h2>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr>
                      {[
                        "Date & Time",
                        "Forecast",
                        "Actual",
                        "Forecast Error",
                      ].map((heading) => (
                        <th
                          key={heading}
                          style={{
                            padding: "12px",
                            borderBottom: "2px solid #e4e4e7",
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {(data.comparisons || []).map((item, index) => (
                      <tr key={`${item.startTime}-${index}`}>
                        <td style={{ padding: "12px" }}>
                          {new Date(item.startTime).toLocaleString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "UTC",
                            }
                          )}
                        </td>

                        <td style={{ padding: "12px" }}>
                          {item.forecast_generation}
                        </td>

                        <td style={{ padding: "12px" }}>
                          {item.actual_hourly_average}
                        </td>

                        <td style={{ padding: "12px" }}>
                          {item.error_forecast_minus_actual}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default App;