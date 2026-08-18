import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import './App.css';
import TemperatureDisplay from './components/TemperatureDisplay';
import MotorControl from './components/MotorControl';
import ValveControl from './components/ValveControl';

// Magia para Producción vs Local: 
// Toma la URL de Render, o usa localhost si estamos probando en la PC
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [machineData, setMachineData] = useState({ motor_speed: null, valve_state: null, ambient_temperature: null });
  const [theme, setTheme] = useState('dark');
  const [toast, setToast] = useState(null);
  
  const alertShown = useRef(false);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const showNotification = (message, icon) => {
    setToast({ message, icon });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchMachineData = async () => {
    try {
      // Usamos API_URL aquí
      const response = await fetch(`${API_URL}/machine`);
      const data = await response.json();
      setMachineData(data);
    } catch (err) {
      showNotification("Error conectando al servidor", <AlertTriangle size={20} color="#ff3b30"/>);
    }
  };

  useEffect(() => { fetchMachineData(); }, []);

  useEffect(() => {
    if (machineData.motor_speed > 500 && machineData.valve_state === "CLOSED") {
      if (!alertShown.current) {
        showNotification("¡Precaución! Altas RPM con válvula cerrada. Se sugiere abrirla.", <AlertTriangle size={20} color="#ffcc00"/>);
        alertShown.current = true;
      }
    } 
    else if (machineData.ambient_temperature > 30 && machineData.motor_speed > 800) {
      if (!alertShown.current) {
        showNotification("Temperatura ext. alta. Considere bajar las RPM.", <Info size={20} color="#007aff"/>);
        alertShown.current = true;
      }
    } 
    else if (machineData.motor_speed <= 500 || machineData.valve_state === "OPEN") {
      alertShown.current = false;
    }
  }, [machineData.motor_speed, machineData.valve_state, machineData.ambient_temperature]);


  const handleToggleValve = async (newState) => {
    try {
      // Usamos API_URL aquí
      const response = await fetch(`${API_URL}/machine/valve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState })
      });
      if (response.ok) {
        setMachineData(prev => ({ ...prev, valve_state: newState }));
        showNotification(
          newState === "OPEN" ? "Válvula Abierta" : "Válvula Cerrada", 
          <CheckCircle size={20} color={newState === "OPEN" ? "#34c759" : "#ff3b30"}/>
        );
      }
    } catch (err) { showNotification("Error al cambiar válvula", <AlertTriangle size={20} color="#ff3b30"/>); }
  };

  const handleChangeSpeed = async (newSpeed) => {
    try {
      // Usamos API_URL aquí
      const response = await fetch(`${API_URL}/machine/motor`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speed: newSpeed })
      });
      if (response.ok) {
        setMachineData(prev => ({ ...prev, motor_speed: newSpeed }));
        showNotification(`Motor ajustado a ${newSpeed} RPM`, <CheckCircle size={20} color="#34c759"/>);
      }
    } catch (err) { showNotification("Error al cambiar velocidad", <AlertTriangle size={20} color="#ff3b30"/>); }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '0 20px' }}>
      
      {toast && (
        <div className="ios-toast">
          {toast.icon} {toast.message}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Control Panel</h1>
        
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', padding: '5px' }}
        >
          {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
        </button>
      </div>

      <TemperatureDisplay temperature={machineData.ambient_temperature} />
      <MotorControl motorSpeed={machineData.motor_speed} onChangeSpeed={handleChangeSpeed} showNotification={showNotification} />
      <ValveControl valveState={machineData.valve_state} onToggleValve={handleToggleValve} />
    </div>
  );
}

export default App;