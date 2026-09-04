import { useState } from 'react';
import { useCaja } from '../hooks/cierrecaja';
import { useToast } from '../contexts';
import '../styles/admin.css';

export default function CierreCaja() {
  const { cajaInfo, resumen, cargando, abrirCaja, cerrarCaja, refrescar } = useCaja();
  const { showToast } = useToast();
  const [inputBase, setInputBase] = useState('');
  const [inputNequi, setInputNequi] = useState('');
  const [confirmandoCierre, setConfirmandoCierre] = useState(false);

  if (cargando) {
    return (
      <div className="caja-centrada-wrapper">
        <div className="loader-spinner"></div>
        <p className="text-muted" style={{ marginTop: '16px' }}>Verificando estado de caja...</p>
      </div>
    );
  }

  const handleAbrir = async () => {
    const montoEfectivo = Number(inputBase);
    const montoNequiValue = Number(inputNequi);

    if (inputBase === '' || inputNequi === '' || montoEfectivo < 0 || montoNequiValue < 0) {
      showToast('Por favor, ingresa los montos iniciales de Efectivo y Nequi.', 'warning');
      return;
    }

    const resultado = await abrirCaja(montoEfectivo, montoNequiValue);
    if (resultado?.success) {
      setInputBase('');
      setInputNequi('');
    } else {
      showToast('Error al abrir el turno.', 'error');
    }
  };

  if (!cajaInfo || cajaInfo.estado !== 'abierto') {
    return (
      <div className="caja-centrada-wrapper fade-in-up">
        <div className="turno-icon-wrapper"><i className="fas fa-store turno-icon"></i></div>
        <h2 className="turno-titulo">NUEVO TURNO</h2>
        <p className="turno-subtitulo">Ingresa los saldos iniciales para comenzar la jornada</p>
        <div className="turno-form-card">
          <div className="turno-input-group">
            <label className="turno-input-label"><i className="fas fa-money-bill-wave"></i> Base Efectivo (Cajón)</label>
            <div className="turno-input-wrapper">
              <span className="turno-input-prefix">$</span>
              <input type="number" className="turno-input" placeholder="0" value={inputBase} onChange={(e) => setInputBase(e.target.value)} autoFocus />
            </div>
          </div>
          <div className="turno-input-group">
            <label className="turno-input-label"><i className="fas fa-mobile-alt"></i> Saldo Nequi (Celular)</label>
            <div className="turno-input-wrapper">
              <span className="turno-input-prefix">$</span>
              <input type="number" className="turno-input" placeholder="0" value={inputNequi} onChange={(e) => setInputNequi(e.target.value)} />
            </div>
          </div>
          <button onClick={handleAbrir} className="turno-btn-abrir"><i className="fas fa-unlock-alt"></i> ABRIR TURNO AHORA</button>
        </div>
      </div>
    );
  }

  const baseEfectivo = Number(cajaInfo.montoInicial || 0);
  const baseNequi = Number(cajaInfo.montoNequi || 0);

  const ejecutarCierre = async () => {
    if (!confirmandoCierre) {
      setConfirmandoCierre(true);
      showToast('¿Cerrar turno? Confirma pulsando el botón nuevamente.', 'warning');
      setTimeout(() => setConfirmandoCierre(false), 5000);
      return;
    }
    setConfirmandoCierre(false);
    const resultado = await cerrarCaja(cajaInfo.id);
    if (resultado?.success) {
      showToast('Turno cerrado exitosamente.', 'success');
      await refrescar();
    } else {
      showToast('Error al cerrar el turno.', 'error');
    }
  };

  return (
    <div className="fade-in-up">
      <div className="caja-header-bar">
        <div>
          <h1><i className="fas fa-cash-register"></i> Control de Turno</h1>
          <p>ID #{cajaInfo.id} | Abierto: {new Date(cajaInfo.fechaApertura).toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="resumen-grid-3">
        <div className="card-resumen-turno border-ingresos">
          <p className="card-label-small"><i className="fas fa-arrow-down"></i> Ingresos</p>
          <div className="card-fila"><span>Bases (Efec + Nequi)</span><strong>${(baseEfectivo + baseNequi).toLocaleString()}</strong></div>
          <div className="card-fila"><span>Ventas Efectivo</span><strong className="val-green">+${resumen.efectivo?.toLocaleString() || 0}</strong></div>
          <div className="card-fila"><span>Ventas Nequi</span><strong className="val-blue">+${resumen.nequi?.toLocaleString() || 0}</strong></div>
        </div>
        <div className="card-resumen-turno border-egresos">
          <p className="card-label-small"><i className="fas fa-arrow-up"></i> Egresos / Compras</p>
          <div className="card-fila"><span>Insumos</span><strong className="val-red">-${resumen.insumos?.toLocaleString() || 0}</strong></div>
          <div className="card-fila"><span>Equipos</span><strong className="val-red">-${resumen.equipos?.toLocaleString() || 0}</strong></div>
        </div>
        <div className="card-resumen-turno border-amarillo">
          <p className="card-label-small"><i className="fas fa-chart-simple"></i> Total Ventas Brutas</p>
          <p className="monto-grande">${resumen.productos?.toLocaleString() || 0}</p>
          <p className="monto-sub">Solo productos vendidos</p>
        </div>
      </div>

      <div className="balance-doble">
        <div className="card-balance">
          <div className="bal-icon">💵</div>
          <p className="bal-label">Efectivo Físico (Cajón)</p>
          <p className="bal-monto">${resumen.totalAcumulado?.toLocaleString() || 0}</p>
          <p className="bal-sub">Base Efec + Ventas Efec - Gastos Efec</p>
        </div>
        <div className="card-balance nequi-balance">
          <div className="bal-icon">📱</div>
          <p className="bal-label">Saldo en Nequi (Celular)</p>
          <p className="bal-monto">${resumen.saldoNequiActual?.toLocaleString() || 0}</p>
          <p className="bal-sub">Base Nequi + Ventas Nequi - Gastos Nequi</p>
        </div>
      </div>

      <button onClick={ejecutarCierre} className={`btn-cerrar-turno ${confirmandoCierre ? 'btn-cerrar-turno--confirmar' : ''}`}>
        <i className="fas fa-lock"></i>
        {confirmandoCierre ? '⚠️ Pulsa de nuevo para confirmar cierre' : 'Finalizar Jornada y Cerrar Turno'}
      </button>
    </div>
  );
}
