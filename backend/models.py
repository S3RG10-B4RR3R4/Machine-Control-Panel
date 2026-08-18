from enum import Enum
from pydantic import BaseModel

# Definimos las únicas dos opciones válidas para la válvula
class ValveState(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"

# Definimos la estructura de nuestra máquina
class MachineState(BaseModel):
    motor_speed: int
    valve_state: ValveState

# Creamos una instancia global que actuará como nuestra "base de datos en memoria"
# Inicializamos la máquina con velocidad 0 y válvula cerrada.
current_machine_state = MachineState(motor_speed=0, valve_state=ValveState.CLOSED)