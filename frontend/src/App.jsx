
import { useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-01-02");
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard(event) {
    if (event) event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });

      const response = await fetch(`${API_URL}/api/metrics?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "डेटा मिळवता आला नाही.");
      }

      setMetrics(data);
    } catch (err) {
      setError(
        `${err.message} Backend सुरू आहे का ते तपासा.`
      );
    } finally {
      setLoading(false);
    }
  }

  function formatNumber(value) {
    return Number(value).toLocaleString("en-GB", {
      maximumFractionDigits: 2,
    });
  }

  return (
    <main className="dashboard">
      <header className="header">
        <div>
          <p className="eyebrow">ENERGY ANALYTICS PLATFORM</p>
          <h1>UK Wind Forecast Dashboard</h1>
          <p className="subtitle">
            Day-ahead forecast accuracy and actual wind generation
          </p>
        </div>
        <div className="status">● Wind Energy</div>
      </header>

      <form className="filters" onSubmit={loadDashboard}>
        <label>
          Start date
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(event) => setStartDate(event.target.value)}
            required
          />
        </label>

        <label>
          End date
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(event) => setEndDate(event.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Load Dashboard"}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {!metrics && !loading && !error && (
        <section className="panel welcome">
          <h2>Wind generation overview</h2>
          <p>
            Select a date range and click Load Dashboard to view
            forecast accuracy metrics.
          </p>
          <button onClick={() => loadDashboard()} type="button">
            Load January 2026 data
          </button>
        </section>
      )}

      {loading && <p className="loading">Fetching wind data...</p>}

      {metrics && (
        <>
          <section className="summary">
            <article className="metric-card">
              <p>Matched Records</p>
              <h2>{formatNumber(metrics.matched_records)}</h2>
              <span>Hourly comparisons</span>
            </article>

            <article className="metric-card">
              <p>MAE</p>
              <h2>{formatNumber(metrics.metrics.MAE)}</h2>
              <span>Mean Absolute Error</span>
            </article>

            <article className="metric-card">
              <p>RMSE</p>
              <h2>{formatNumber(metrics.metrics.RMSE)}</h2>
              <span>Root Mean Squared Error</span>
            </article>

            <article className="metric-card">
              <p>Bias</p>
              <h2>{formatNumber(metrics.metrics.Bias)}</h2>
              <span>Forecast minus actual</span>
            </article>
          </section>

          <section className="panel">
            <h2>Forecast Accuracy</h2>
            <p>{metrics.bias_interpretation}</p>
            <p><strong>Source:</strong> {metrics.data_source}</p>
            <p><strong>Actual aggregation:</strong> {metrics.actual_aggregation}</p>
            <p>
              <strong>Period:</strong> {metrics.start_date} to {metrics.end_date}
            </p>
          </section>

          <section className="panel">
            <h2>Hourly Forecast vs Actual</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Time (UTC)</th>
                    <th>Forecast</th>
                    <th>Actual hourly average</th>
                    <th>Forecast error</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.comparisons.map((item) => (
                    <tr key={item.startTime}>
                      <td>
                        {new Date(item.startTime).toISOString().slice(0, 16).replace("T", " ")}
                      </td>
                      <td>{formatNumber(item.forecast_generation)}</td>
                      <td>{formatNumber(item.actual_hourly_average)}</td>
                      <td className={item.error_forecast_minus_actual > 0 ? "positive" : "negative"}>
                        {formatNumber(item.error_forecast_minus_actual)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <footer className="footer">
        Data from Elexon BMRS · Times shown in UTC
      </footer>
    </main>
  );
}

export default App;
