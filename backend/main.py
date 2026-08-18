import os
import time
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx
from models import current_machine_state, ValveState

load_dotenv()

# Logger para poder ver qué pasa en los logs de Render
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn.error")

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

# Caché simple en memoria para no golpear el límite diario de Open-Meteo.
# En Render (producción) SÍ usamos caché. En local (desarrollo) NO,
# para que cada petición traiga el dato fresco como antes.
IS_RENDER = os.getenv("RENDER") == "true"
WEATHER_CACHE_TTL_SECONDS = 900 if IS_RENDER else 0  # 15 min en Render, 0 en local

_weather_cache = {
    "temperature": 28.5,
    "last_fetched": 0.0,
}

@app.get("/")
def read_root():
    """Ruta raíz para verificar que el servidor está en línea."""
    return {"status": "online", "message": "Machine Control Panel API running successfully"}

@app.get("/machine")
async def get_machine_state():
    """Obtiene el estado de la máquina y la temperatura real."""
    now = time.time()
    temperature = _weather_cache["temperature"]

    # Si el dato en caché sigue "fresco", lo usamos directo y no llamamos a la API
    if now - _weather_cache["last_fetched"] < WEATHER_CACHE_TTL_SECONDS:
        logger.info(f"Usando temperatura en caché: {temperature}")
    else:
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={LATITUDE}&longitude={LONGITUDE}&current=temperature_2m"
        )
        headers = {"User-Agent": "MachineControlPanelApp/1.0"}

        logger.info(f"Consultando clima en URL: {url}")

        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            try:
                response = await client.get(url, headers=headers)
                logger.info(f"Open-Meteo status_code: {response.status_code}")
                logger.info(f"Open-Meteo body (primeros 300 chars): {response.text[:300]}")

                if response.status_code == 200:
                    data = response.json()
                    temperature = data.get("current", {}).get("temperature_2m", temperature)
                    _weather_cache["temperature"] = temperature
                    _weather_cache["last_fetched"] = now
                    logger.info(f"Temperatura obtenida correctamente: {temperature}")
                else:
                    logger.warning(
                        f"Open-Meteo devolvió status {response.status_code}, "
                        f"usando último valor conocido ({temperature})"
                    )
            except httpx.TimeoutException as e:
                logger.error(f"Timeout consultando Open-Meteo: {e}")
            except httpx.RequestError as e:
                logger.error(f"Error de red/DNS consultando Open-Meteo: {e}")
            except Exception as e:
                logger.error(f"Error inesperado consultando Open-Meteo: {e}")

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