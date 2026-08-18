import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx
from models import current_machine_state, ValveState

load_dotenv()

LATITUDE = float(os.getenv("WEATHER_LATITUDE", 20.9754))
LONGITUDE = float(os.getenv("WEATHER_LONGITUDE", -89.6170))

app = FastAPI(title="Machine Control Panel API")

# Configuración lista para Producción (Render) y Local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permite cualquier origen (Render o Localhost)
    allow_credentials=False, # Debe ser False si usas "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos de datos
class MotorUpdate(BaseModel):
    speed: int

class ValveUpdate(BaseModel):
    state: ValveState

@app.get("/machine")
async def get_machine_state():
    """Obtiene el estado actual de la máquina y la temperatura real desde Open-Meteo."""
    url = f"https://api.open-meteo.com/v1/forecast?latitude={LATITUDE}&longitude={LONGITUDE}&current=temperature_2m"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            temperature = data["current"]["temperature_2m"]
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"No se pudo obtener la temperatura externa: {str(e)}")

    return {
        "motor_speed": current_machine_state.motor_speed,
        "valve_state": current_machine_state.valve_state,
        "ambient_temperature": temperature
    }

@app.put("/machine/motor")
def update_motor(update: MotorUpdate):
    """Actualiza la velocidad del motor."""
    current_machine_state.motor_speed = update.speed
    return {
        "message": "Velocidad del motor actualizada",
        "motor_speed": current_machine_state.motor_speed
    }

@app.put("/machine/valve")
def update_valve(update: ValveUpdate):
    """Actualiza el estado de la válvula."""
    current_machine_state.valve_state = update.state
    return {
        "message": "Estado de la válvula actualizado",
        "valve_state": current_machine_state.valve_state
    }