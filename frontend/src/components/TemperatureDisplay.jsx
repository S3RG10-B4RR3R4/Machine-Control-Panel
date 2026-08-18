import { ThermometerSun } from 'lucide-react';

function TemperatureDisplay({ temperature }) {
  // Verificación estricta: si no hay dato, mostramos '--'
  const displayTemp = (temperature !== null && temperature !== undefined) ? `${temperature}°C` : '--';

  return (
    <div className="ios-card">
      <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase' }}>Temperatura</h3>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThermometerSun size={20} color="var(--accent-blue)" />
          <span style={{ fontSize: '18px' }}>Ambiente</span>
        </div>
        <span style={{ fontSize: '32px', fontWeight: 'bold' }}>
          {displayTemp}
        </span>
      </div>
    </div>
  );
}

export default TemperatureDisplay;