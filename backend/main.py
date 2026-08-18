import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx
from models import current_machine_state, ValveState

load_dotenv()

# Lectura segura de coordenadas
try:
    LATITUDE = float(os.getenv("WEATHER_LATITUDE", "20.9754"))
    LONGITUDE = float(os.getenv("WEATHER_LONGITUDE", "-89.6170"))
except (ValueError, TypeError):
    LATITUDE = 20.9754
    LONGITUDE = -89.6170

app = FastAPI(title="Machine Control Panel API")

# Configuración CORS para Producción y Local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos
class MotorUpdate(BaseModel):
    speed: int

class ValveUpdate(BaseModel):
    state: ValveState

@app.get("/")
def read_root():
    """Ruta raíz para verificar que el servidor está en línea."""
    return {"status": "online", "message": "Machine Control Panel API running successfully"}

@app.get("/machine")
async def get_machine_state():
    """Obtiene el estado de la máquina y la temperatura real."""
    url = f"https://api.open-meteo.com/v1/forecast?latitude={LATITUDE}&longitude={LONGITUDE}&current=temperature_2m"
    
    temperature = 28.5  # Valor inicial por defecto si hay demora en la red
    headers = {"User-Agent": "MachineControlPanelApp/1.0"}

    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        try:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                temperature = data.get("current", {}).get("temperature_2m", temperature)
        except Exception as e:
            print(f"Aviso: Usando temperatura por defecto por timeout/red: {e}")

    return {
        "motor_speed": current_machine_state.motor_speed,
        "valve_state": current_machine_state.valve_state,
        "ambient_temperature": temperature
    }

@app.put("/machine/motor")
def update_motor(update: MotorUpdate):
    current_machine_state.motor_speed = update.speed
    return {
        "message": "Velocidad del motor actualizada",
        "motor_speed": current_machine_state.motor_speed
    }

@app.put("/machine/valve")
def update_valve(update: ValveUpdate):
    current_machine_state.valve_state = update.state
    return {
        "message": "Estado de la válvula actualizado",
        "valve_state": current_machine_state.valve_state
    }