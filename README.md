# ⚙️ Machine Control Panel (IoT / SCADA Simulator)

A Full-Stack application designed to simulate an industrial machine control interface. It features real-time environmental temperature monitoring via an external API and bidirectional communication between a modern React frontend and a Python FastAPI backend.

The UI is designed with a modern, minimalist, iOS-inspired aesthetic featuring a seamless Dark/Light mode toggle and intelligent safety pop-up alerts.

---

## ✨ Key Features
- **Real-Time Data Integration:** Fetches live ambient temperature using the Open-Meteo API (No API keys required).
- **Smart Safety Alerts:** Intelligent frontend logic that warns the user if RPMs are too high while the safety valve is closed, or if ambient temperatures exceed safe thresholds.
- **RESTful Architecture:** Clear separation of concerns between the client and server.
- **Modern UI/UX:** iOS-style floating toasts (notifications), Lucide icons, and a fluid dark mode implementation.
- **Input Validation:** Backend and frontend validation to prevent negative RPMs or exceeding industrial motor limits (3600 RPM).

---

## 📂 Project Structure

```text
machine-control-panel/
├── backend/                  # Python FastAPI Server
│   ├── .env                  # Environment variables (Ignored by Git - See setup)
│   ├── main.py               # API Endpoints and API integration
│   ├── models.py             # Pydantic data models & State management
│   └── requirements.txt      # Python dependencies
│
└── frontend/                 # React + Vite Client
    ├── src/
    │   ├── components/       # UI Components
    │   │   ├── MotorControl.jsx
    │   │   ├── TemperatureDisplay.jsx
    │   │   └── ValveControl.jsx
    │   ├── App.jsx           # Main smart component & state management
    │   ├── App.css           # Styling and iOS-themed UI
    │   └── main.jsx          # React entry point
    ├── package.json          # Node dependencies
    └── vite.config.js        # Vite bundler configuration
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 18+

### 1. Backend Setup (FastAPI)
Navigate to the backend directory and set up the Python virtual environment:

```bash
cd backend
python -m venv venv

# Activate the virtual environment:
# On Windows:
source venv/Scripts/activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies:
pip install -r requirements.txt
```

### ⚠️ CRITICAL: Environment Variables
Because `.env` files contain sensitive data, they are not tracked by Git. You must create one manually to make the weather API work.

1. Create a file named `.env` inside the `backend/` folder.
2. Add the following coordinates (Default: Mérida, Yucatán):

```
WEATHER_LATITUDE=20.9754
WEATHER_LONGITUDE=-89.6170
```

3. Start the backend server:

```bash
uvicorn main:app --reload
```

(The backend runs on `http://localhost:8000`)

### 2. Frontend Setup (React/Vite)
Open a new terminal window (keep the backend running), navigate to the frontend directory, and install the dependencies:

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

(The frontend runs on `http://localhost:5173`)

## 🧪 Testing the Application
Once both servers are running, open `http://localhost:5173` in your browser.

### The "Alaska Test" (Verifying the live API):
To prove the application is fetching real-time weather data and not using mocked values:

1. Open your `backend/.env` file.
2. Change the coordinates to Anchorage, Alaska:

```
WEATHER_LATITUDE=61.2181
WEATHER_LONGITUDE=-149.9003
```

3. Save the file. (Uvicorn should auto-reload; if not, restart the backend).
4. Refresh the React app in your browser. You will see the temperature instantly drop to reflect Alaska's current weather!

## 📡 API Documentation
The backend provides automatic Swagger UI documentation. While the backend server is running, you can explore and test the endpoints directly by navigating to:
👉 `http://localhost:8000/docs`

## 🛠️ Troubleshooting

**404 Not Found when opening http://localhost:8000**
> Fix: This is normal. The API does not have a root `/` endpoint. Add `/docs` to the URL to see the interface, or use the React frontend.

**422 Unprocessable Entity when changing Motor RPM**
> Fix: The backend strictly expects an integer (whole number). Decimals or extremely large numbers (memory overflow) will be rejected by FastAPI's built-in validation.

**Frontend shows "Error conectando al servidor"**
> Fix: Ensure the Python backend is running on port 8000. If it's running on a different port, CORS will block the request. Check your terminal for errors.

**Temperature shows as null or backend crashes on startup**
> Fix: You likely forgot to create the `.env` file in the `backend/` folder. Refer to the Environment Variables step in the installation guide.