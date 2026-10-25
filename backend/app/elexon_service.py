
import requests
from datetime import date, datetime, timedelta, timezone

BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1"


def validate_dates(start_date: str, end_date: str):
    start = date.fromisoformat(start_date)
    end = date.fromisoformat(end_date)

    if end < start:
        raise ValueError("end_date must be on or after start_date")


def parse_utc(value: str) -> datetime:
    parsed = datetime.fromisoformat(
        value.replace("Z", "+00:00")
    )

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)

    return parsed.astimezone(timezone.utc)


def fetch_wind_forecasts(start_date: str, end_date: str):
    """
    Fetch WINDFOR records for the requested target dates.
    Keep only records published before the target day starts.
    """
    validate_dates(start_date, end_date)

    start = date.fromisoformat(start_date)
    end = date.fromisoformat(end_date)

    url = f"{BASE_URL}/datasets/WINDFOR/stream"

    params = {
        "publishDateTimeFrom": (
            f"{(start - timedelta(days=1)).isoformat()}T00:00:00Z"
        ),
        "publishDateTimeTo": (
    f"{(end + timedelta(days=1)).isoformat()}T00:00:00Z"
),
    }

    response = requests.get(url, params=params, timeout=60)
    response.raise_for_status()
    records = response.json()

    if not isinstance(records, list):
        raise ValueError("Unexpected Elexon forecast response format")

    best_by_time = {}

    for record in records:
        if not record.get("startTime") or not record.get("publishTime"):
            continue

        target_time = parse_utc(record["startTime"])
        publish_time = parse_utc(record["publishTime"])

        if not start <= target_time.date() <= end:
            continue

        # Day-ahead cutoff: midnight UTC at the start of target date.
        cutoff = datetime.combine(
            target_time.date(),
            datetime.min.time(),
            tzinfo=timezone.utc,
        )

        if publish_time > cutoff:
            continue

        key = target_time.isoformat()
        previous = best_by_time.get(key)

        if previous is None:
            best_by_time[key] = record
        elif publish_time > parse_utc(previous["publishTime"]):
            best_by_time[key] = record

    return sorted(
        best_by_time.values(),
        key=lambda record: record["startTime"],
    )


def fetch_actual_wind_generation(start_date: str, end_date: str):
    """Fetch actual wind generation from FUELHH."""
    validate_dates(start_date, end_date)

    url = f"{BASE_URL}/datasets/FUELHH/stream"

    params = {
        "settlementDateFrom": start_date,
        "settlementDateTo": end_date,
    }

    response = requests.get(url, params=params, timeout=60)
    response.raise_for_status()
    records = response.json()

    if not isinstance(records, list):
        raise ValueError("Unexpected Elexon actual response format")

    return [
        record
        for record in records
        if str(record.get("fuelType", "")).upper() == "WIND"
    ]
