import { useState } from 'react';
import { Gauge, AlertTriangle } from 'lucide-react';

function MotorControl({ motorSpeed, onChangeSpeed, showNotification }) {
  const [inputValue, setInputValue] = useState('');
  
  // Límite realista para un motor industrial AC
  const MAX_RPM = 3600; 

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedSpeed = parseInt(inputValue, 10);
    
    if (isNaN(parsedSpeed)) return;

    // Validación 1: Límite máximo
    if (parsedSpeed > MAX_RPM) {
      showNotification(`Peligro: El motor no soporta más de ${MAX_RPM} RPM`, <AlertTriangle size={20} color="#ff3b30"/>);
      return; // Detenemos la ejecución, no se envía al backend
    }

    // Validación 2: Límite mínimo (no negativo)
    if (parsedSpeed < 0) {
      showNotification("Error: La velocidad no puede ser negativa", <AlertTriangle size={20} color="#ffcc00"/>);
      return; // Detenemos la ejecución
    }

    // Si pasa las validaciones, lo enviamos al backend
    onChangeSpeed(parsedSpeed);
    setInputValue('');
  };

  return (
    <div className="ios-card">
      <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase' }}>Motor Principal</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gauge size={20} color="var(--accent-blue)" />
          <span style={{ fontSize: '18px' }}>Velocidad</span>
        </div>
        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{motorSpeed !== null ? motorSpeed : '--'} RPM</span>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
        <input 
          type="number" 
          className="ios-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Max ${MAX_RPM}`}
        />
        <button type="submit" className="ios-button" style={{ flexGrow: 1 }}>
          Aplicar
        </button>
      </form>
    </div>
  );
}
export default MotorControl;