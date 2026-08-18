import { ThermometerSun } from 'lucide-react';

function TemperatureDisplay({ temperature }) {
  return (
    <div className="ios-card">
      <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase' }}>Clima Mérida</h3>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThermometerSun size={20} color="var(--accent-blue)" />
          <span style={{ fontSize: '18px' }}>Temperatura Ext.</span>
        </div>
        <span style={{ fontSize: '32px', fontWeight: 'bold' }}>
          {temperature !== null ? `${temperature}°C` : '--'}
        </span>
      </div>
    </div>
  );
}
export default TemperatureDisplay;