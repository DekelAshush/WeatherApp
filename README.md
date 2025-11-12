# WeatherApp

Full-stack weather dashboard with a React frontend (`weatherapp-front`) and an Express/PostgreSQL backend (`weatherapp-back`). Use this guide to get the project running locally after cloning the repository.

## 1. Prerequisites
- Node.js 18 or newer
- npm 9 or newer (bundled with Node.js)
- PostgreSQL 13+ running locally or remotely
- OpenWeather API key
- Google Maps/YouTube Data API key

## 2. Clone The Repository
```bash
git clone <repo-url>
cd weatherapp
```

## 3. Backend Setup (`weatherapp-back`)
- Install dependencies:
  ```bash
  cd weatherapp-back
  npm install
  ```
- Create a `.env` file (same directory) and populate it:
  ```bash
  WEATHER_API_KEY=<your_openweather_api_key>
  GOOGLE_API_KEY=<your_google_maps_and_youtube_api_key>
  FRONTEND_URL=http://localhost:5173
  PORT=3001
  DATABASE_URL=postgres://user:password@localhost:5432/weatherapp
  # or configure individual PG_* variables instead of DATABASE_URL
  # PG_HOST=localhost
  # PG_PORT=5432
  # PG_DATABASE=weatherapp
  # PG_USER=postgres
  # PG_PASSWORD=<your_password>
  # PG_SSL=false
  ```
- Ensure the target database exists. For example:
  ```bash
  createdb weatherapp
  ```
- Start the backend (new terminal recommended):
  ```bash
  npm run dev
  ```
  The API will be available at `http://localhost:3001`.

## 4. Frontend Setup (`weatherapp-front`)
- From the repository root:
  ```bash
  cd weatherapp-front
  npm install
  ```
- (Optional) Create a `.env` file to point the frontend at a non-default backend URL:
  ```bash
  VITE_API_URL=http://localhost:3001
  ```
- Start the Vite dev server:
  ```bash
  npm run dev
  ```
  By default Vite serves the app at `http://localhost:5173`.

## 5. Development Notes
- The backend initializes the `weather_history` table automatically on startup.
- API keys are required for the weather search to succeed; requests fail fast if they are missing.
- When running locally, keep both frontend and backend terminals open.

## 6. Troubleshooting
- **Port conflicts**: Update `PORT` (backend) or use `npm run dev -- --port <number>` (frontend).
- **Database connection errors**: Verify `.env` credentials and that the database exists.
- **CORS issues**: Ensure `FRONTEND_URL` in the backend `.env` matches the URL you visit in the browser.

## 7. Available Scripts
- Backend
  - `npm run dev` – start Express with `nodemon`.
  - `npm start` – start Express without auto-reload.
- Frontend
  - `npm run dev` – start Vite dev server.
  - `npm run build` – create production build.
  - `npm run preview` – serve the production build locally.

Happy hacking!

