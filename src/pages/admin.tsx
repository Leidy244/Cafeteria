import { useState, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import Inventario from './Inventario';
import CierreCaja from './cierrecaja';
import Reporte from './Reporte';
import { useCaja } from '../hooks/cierrecaja';
import '../styles/admin.css';

const titulos: Record<string, string> = {
  cierrecaja: 'Control de Turno',
  inventario: 'Gestión de Productos',
  cafeteria: 'Gestión de Insumos',
  activos: 'Gestión de Equipos',
  reporte: 'Reporte de Ventas',
};

export default function AdminDashboard() {
  const [tabActiva, setTabActiva] = useState('cierrecaja');
  const { cajaInfo, cargando } = useCaja();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const estadoCaja = cajaInfo?.estado === 'abierto' ? 'Abierto' : 'Cerrado';

  const handleCerrarSesion = () => {
    navigate('/caja', { replace: true });
    startTransition(() => logout());
  };

  if (cargando) return <div className="loader">Cargando sistema...</div>;

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Juyasia Admin</h2>
          <div className="status-online">
            <i className="fas fa-circle" style={{ fontSize: '8px' }} />
            <span>Sistema Online</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {([
            ['cierrecaja', 'fa-cash-register', 'Cierre caja'],
            ['inventario', 'fa-shopping-cart', 'Productos'],
            ['cafeteria', 'fa-coffee', 'Insumos'],
            ['activos', 'fa-microchip', 'Equipos'],
            ['reporte', 'fa-chart-line', 'Reporte de Ventas'],
          ] as const).map(([key, icon, label]) => (
            <button key={key} className={tabActiva === key ? 'active' : ''} onClick={() => setTabActiva(key)}>
              <i className={`fas ${icon}`} /><span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleCerrarSesion}>
            <i className="fas fa-sign-out-alt" /><span>Volver al Menú</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-header">
          <h1>{titulos[tabActiva]}</h1>
          <p className="status-line">
            Estado de caja:{' '}
            <strong className={estadoCaja === 'Abierto' ? 'val-green' : 'val-red'}>{estadoCaja}</strong>
          </p>
        </div>

        <section className="inventario-container">
          {tabActiva === 'cierrecaja' && <CierreCaja />}
          {tabActiva === 'inventario' && <Inventario tipo="venta" />}
          {tabActiva === 'cafeteria' && <Inventario tipo="insumo" />}
          {tabActiva === 'activos' && <Inventario tipo="equipo" />}
          {tabActiva === 'reporte' && <Reporte />}
        </section>
      </main>
    </div>
  );
}
