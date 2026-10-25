from datetime import datetime, timezone
import math

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.elexon_service import (
    fetch_wind_forecasts,
    fetch_actual_wind_generation,
)

app = FastAPI(title="UK Wind Forecast Dashboard API")

# CORS configuration for local development and Render deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://wind-forecast-dashboard-2.onrender.com",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def parse_utc(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)

    return parsed


@app.get("/")
def root():
    return {
        "message": "UK Wind Forecast Dashboard API is running"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/api/forecast/summary")
def forecast_summary(
    start_date: str = "2026-01-01",
    end_date: str = "2026-01-02",
):
    try:
        forecasts = fetch_wind_forecasts(start_date, end_date)

        return {
            "start_date": start_date,
            "end_date": end_date,
            "records_returned": len(forecasts),
            "forecasts": forecasts,
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/forecasts")
def get_forecasts(
    start_date: str = "2026-01-01",
    end_date: str = "2026-01-02",
):
    try:
        return fetch_wind_forecasts(start_date, end_date)

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/actuals")
def get_actuals(
    start_date: str = "2026-01-01",
    end_date: str = "2026-01-02",
):
    try:
        return fetch_actual_wind_generation(start_date, end_date)

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/metrics")
def get_metrics(
    start_date: str = "2026-01-01",
    end_date: str = "2026-01-02",
):
    try:
        forecasts = fetch_wind_forecasts(start_date, end_date)
        actuals = fetch_actual_wind_generation(start_date, end_date)

        hourly_values = {}

        # Group actual generation readings by hour
        for record in actuals:
            if (
                not record.get("startTime")
                or record.get("generation") is None
            ):
                continue

            timestamp = parse_utc(record["startTime"])

            hour_start = timestamp.replace(
                minute=0,
                second=0,
                microsecond=0,
            )

            key = hour_start.isoformat()

            hourly_values.setdefault(key, []).append(
                float(record["generation"])
            )

        # Calculate hourly averages
        actual_by_time = {
            key: sum(values) / len(values)
            for key, values in hourly_values.items()
        }

        comparisons = []

        # Match forecast records with actual readings
        for record in forecasts:
            if (
                not record.get("startTime")
                or record.get("generation") is None
            ):
                continue

            timestamp = parse_utc(record["startTime"])
            key = timestamp.isoformat()

            if key not in actual_by_time:
                continue

            forecast_value = float(record["generation"])
            actual_value = actual_by_time[key]
            error = forecast_value - actual_value

            comparisons.append({
                "startTime": timestamp.isoformat(),
                "forecast_generation": forecast_value,
                "actual_hourly_average": actual_value,
                "error_forecast_minus_actual": error,
            })

        if not comparisons:
            raise HTTPException(
                status_code=404,
                detail=(
                    "No matching forecast and actual records found."
                ),
            )

        errors = [
            item["error_forecast_minus_actual"]
            for item in comparisons
        ]

        count = len(errors)

        mae = sum(abs(error) for error in errors) / count

        rmse = math.sqrt(
            sum(error ** 2 for error in errors) / count
        )

        bias = sum(errors) / count

        if bias > 0:
            interpretation = (
                "Forecast overestimated actual generation on average."
            )
        elif bias < 0:
            interpretation = (
                "Forecast underestimated actual generation on average."
            )
        else:
            interpretation = (
                "Forecast matched actual generation on average."
            )

        return {
            "data_source": "Elexon WINDFOR and FUELHH",
            "start_date": start_date,
            "end_date": end_date,
            "matched_records": count,
            "actual_aggregation": (
                "Hourly average of available half-hourly readings"
            ),
            "metrics": {
                "MAE": round(mae, 2),
                "RMSE": round(rmse, 2),
                "Bias": round(bias, 2),
            },
            "bias_interpretation": interpretation,
            "comparisons": comparisons,
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )