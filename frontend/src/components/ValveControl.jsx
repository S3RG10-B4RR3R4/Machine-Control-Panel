import { Zap } from 'lucide-react';

function ValveControl({ valveState, onToggleValve }) {
  const isOpen = valveState === "OPEN";

  return (
    <div className="ios-card">
      <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase' }}>Válvula de Seguridad</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={20} color={isOpen ? 'var(--accent-green)' : 'var(--accent-red)'} />
          <span style={{ fontSize: '18px' }}>Estado</span>
        </div>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: isOpen ? 'var(--accent-green)' : 'var(--accent-red)' }}>
          {valveState || '--'}
        </span>
      </div>
      
      <button 
        className="ios-button"
        onClick={() => onToggleValve(isOpen ? "CLOSED" : "OPEN")}
        style={{ 
          width: '100%', 
          backgroundColor: isOpen ? 'var(--bg-color)' : 'var(--accent-blue)',
          color: isOpen ? 'var(--accent-red)' : 'white'
        }}
      >
        {isOpen ? 'Cerrar Válvula' : 'Abrir Válvula'}
      </button>
    </div>
  );
}
export default ValveControl;