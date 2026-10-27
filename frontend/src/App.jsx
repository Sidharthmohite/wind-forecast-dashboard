import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import "./App.css";

const API_URL = "https://wind-forecast-dashboard-9ha5.onrender.com";

function App() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const fetchMetrics = async (start, end) => {
    if (!start || !end) {
      setError("Please select both start and end dates.");
      return;
    }

    if (start > end) {
      setError("Start date must be before or equal to end date.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setHasSearched(true);

      const url =
        `${API_URL}/api/metrics` +
        `?start_date=${encodeURIComponent(start)}` +
        `&end_date=${encodeURIComponent(end)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Dashboard request failed:", err);
      setData(null);
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const comparisons = Array.isArray(data?.comparisons)
    ? data.comparisons
    : [];

  const chartData = comparisons.map((item) => ({
    time: item.startTime
      ? new Date(item.startTime).toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
        })
      : "",
    forecast: Number(item.forecast_generation ?? 0),
    actual: Number(item.actual_hourly_average ?? 0),
  }));

  const metrics = data?.metrics ?? {};

  const formatMetric = (value) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(2) : String(value);
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();
    fetchMetrics(startDate, endDate);
  };

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">RENEWABLE ENERGY ANALYTICS</p>
          <h1>UK Wind Forecast Dashboard</h1>
          <p className="subtitle">
            Monitor wind generation forecast accuracy using actual generation
            data.
          </p>
        </div>

        <span className="status-badge">
          {loading ? "Updating..." : "Dashboard"}
        </span>
      </header>

      {/* Date filters */}
      <section className="filter-panel">
        <form onSubmit={handleApplyFilters} className="filter-form">
          <div className="filter-field">
            <label htmlFor="start-date">Start Date</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => {
                setStartDate(event.target.value);
                setError("");
              }}
              required
            />
          </div>

          <div className="filter-field">
            <label htmlFor="end-date">End Date</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => {
                setEndDate(event.target.value);
                setError("");
              }}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Apply Filters"}
          </button>
        </form>
      </section>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {/* Metrics cards */}
      <section className="metrics-grid">
        <article className="metric-card">
          <p>Mean Absolute Error (MAE)</p>
          <h2>{formatMetric(metrics.MAE)}</h2>
        </article>

        <article className="metric-card">
          <p>Root Mean Squared Error (RMSE)</p>
          <h2>{formatMetric(metrics.RMSE)}</h2>
        </article>

        <article className="metric-card">
          <p>Forecast Bias</p>
          <h2>{formatMetric(metrics.Bias)}</h2>
        </article>
      </section>

      {/* Forecast vs Actual chart */}
      <section className="content-panel">
        <div className="section-header">
          <div>
            <h2>Forecast vs Actual Generation</h2>
            <p>Hourly comparison for the selected date range (UTC).</p>
          </div>
        </div>

        <div className="chart-container">
          {loading ? (
            <p className="empty-message">Loading chart data...</p>
          ) : !hasSearched ? (
            <p className="empty-message">
              Select a date range and click Apply Filters to load chart data.
            </p>
          ) : error ? (
            <p className="empty-message">Chart data is unavailable.</p>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 10,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11 }}
                  minTickGap={35}
                />

                <YAxis tick={{ fontSize: 12 }} width={65} />

                <Tooltip />
                <Legend />

                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="Forecast Generation"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />

                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Actual Generation"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-message">
              No records found for the selected dates.
            </p>
          )}
        </div>
      </section>

      {/* Records table */}
      <section className="content-panel">
        <div className="section-header">
          <div>
            <h2>Forecast vs Actual Records</h2>
            <p>
              Selected period: {startDate || "—"} to {endDate || "—"}
            </p>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date &amp; Time (UTC)</th>
                <th>Forecast Generation</th>
                <th>Actual Generation</th>
                <th>Forecast Error</th>
              </tr>
            </thead>

            <tbody>
              {!hasSearched ? (
                <tr>
                  <td colSpan={4} className="empty-message">
                    Select dates and click Apply Filters to view records.
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan={4} className="empty-message">
                    Loading records...
                  </td>
                </tr>
              ) : comparisons.length > 0 && !error ? (
                comparisons.map((item, index) => (
                  <tr key={`${item.startTime ?? "record"}-${index}`}>
                    <td>
                      {item.startTime
                        ? new Date(item.startTime).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "UTC",
                          })
                        : "—"}
                    </td>

                    <td>{formatMetric(item.forecast_generation)}</td>
                    <td>{formatMetric(item.actual_hourly_average)}</td>
                    <td>
                      {formatMetric(item.error_forecast_minus_actual)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="empty-message">
                    {error
                      ? "Unable to display records."
                      : "No records available for this date range."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="dashboard-footer">
        UK Wind Forecast Dashboard
      </footer>
    </main>
  );
}

export default App;