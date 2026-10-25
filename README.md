\# Wind Forecast Dashboard

## Live Demo

**Live Dashboard:** https://wind-forecast-dashboard-2.onrender.com

**Backend API:** https://wind-forecast-dashboard-9ha5.onrender.com

**API Documentation:** https://wind-forecast-dashboard-9ha5.onrender.com/docs



A full-stack web application for comparing wind power generation forecasts with actual wind generation for January 2026.



\## Project Overview



This project uses the Elexon BMRS API to retrieve wind forecast and actual generation data, compare the results, and calculate forecast accuracy metrics.



\## Technology Stack



\- Frontend: React, Vite, CSS

\- Backend: Python, FastAPI

\- Data Source: Elexon BMRS API

\- Containerization: Docker and Docker Compose



\## Features



\- Retrieve wind forecast data.

\- Retrieve actual wind generation data.

\- Compare forecast and actual generation.

\- Calculate MAE, RMSE, and Bias.

\- Provide REST API endpoints.

\- Run the application with Docker Compose.



\## Prerequisites



\- Docker Desktop

\- Docker Compose



\## Run the Project



Start Docker Desktop, open PowerShell in the project folder, and run:



```bash

docker compose up --build

```



Open the dashboard at http://localhost:5173



Backend API documentation: http://localhost:8000/docs



Health check: http://localhost:8000/health



\## API Endpoints



\- `GET /health` — Backend health check.

\- `GET /api/forecasts` — Forecast data.

\- `GET /api/actuals` — Actual generation data.

\- `GET /api/metrics` — Forecast accuracy metrics.

\- `GET /api/forecast/summary` — Forecast summary.



\## Accuracy Metrics



\- \*\*MAE:\*\* Mean Absolute Error.

\- \*\*RMSE:\*\* Root Mean Squared Error.

\- \*\*Bias:\*\* Average forecast minus actual generation.



A positive Bias means forecasts were higher than actual generation on average.



\## Data Source and Validation



The application uses Elexon BMRS WINDFOR forecast data and FUELHH actual generation data filtered for wind generation.



Forecast publication times and hourly aggregation must be validated to ensure a fair comparison without forecast leakage.



\## AI Use Disclosure



AI assistance was used during development for guidance and troubleshooting. All code, calculations, and outputs should be reviewed and verified by the project author. Update this section to accurately reflect the AI tools and tasks used.



\## Project Status



This project is under development. Full-period data validation and public deployment should be confirmed before claiming completion.



