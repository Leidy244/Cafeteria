import React, { useState } from 'react';
import { useCaja } from '../hooks/cierrecaja';
import '../styles/admin.css';

const CierreCaja: React.FC = () => {
  const { cajaInfo, resumen, cargando, abrirCaja, cerrarCaja, refrescar } = useCaja();
  const [inputBase, setInputBase] = useState<string>("");

  if (cargando) {
    return (
      <div className="caja-centrada-wrapper">
        <div className="loader-spinner"></div>
        <p className="text-muted" style={{ marginTop: '16px' }}>Verificando estado de caja...</p>
      </div>
    );
  }

  const handleAbrir = async () => {
    const monto = Number(inputBase);
    if (isNaN(monto) || monto < 0 || inputBase === "") {
      alert("⚠️ Ingresa un monto inicial válido.");
      return;
    }
    const resultado = await abrirCaja(monto);
    if (resultado.success) {
      setInputBase("");
    } else {
      alert("❌ Error al abrir");
    }
  };

  // --- VISTA A: CAJA CERRADA ---
  if (!cajaInfo || cajaInfo.estado !== 'abierto') {
    return (
      <div className="caja-centrada-wrapper fade-in-up">
        <div className="caja-header-text">
          <span className="icon-main">🏪</span>
          <h2>NUEVO TURNO</h2>
          <p>No hay turno activo. Ingresa la base inicial.</p>
        </div>

        <div className="form-card" style={{ maxWidth: '360px', width: '100%' }}>
          <input
            type="number"
            className="grid-form"
            style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '16px' }}
            placeholder="$ Monto base"
            value={inputBase}
            onChange={(e) => setInputBase(e.target.value)}
            autoFocus
          />
          <button onClick={handleAbrir} className="btn-save" style={{ width: '100%' }}>
            ABRIR CAJA AHORA
          </button>
        </div>
      </div>
    );
  }

  // --- VISTA B: CAJA ABIERTA ---
  const baseInicial = Number(cajaInfo.montoInicial || 0);
  const ejecutarCierre = async () => {
    if (window.confirm(`¿Cerrar turno con un total físico de $${resumen.totalAcumulado.toLocaleString()}?`)) {
      // Solo enviamos el ID, ya que el backend calcula o borra lo necesario
      const resultado = await cerrarCaja(cajaInfo.id);

      // El hook ya devuelve { success: true } o { success: false }
      if (resultado && resultado.success) {
        alert("✅ Turno cerrado exitosamente.");
      }
    }
  };

  return (
    <div className="main-content fade-in-up">

      {/* Cabecera */}
      <div className="caja-header-bar">
        <div>
          <h1>💰 Control de Turno</h1>
          <p>ID #{cajaInfo.id} | Abierta: {new Date(cajaInfo.fechaApertura).toLocaleTimeString()}</p>
        </div>
        <button onClick={refrescar} className="btn-refresh">🔄</button>
      </div>

      {/* Grid de 3 tarjetas — se cierra ANTES de la tarjeta amarilla */}
      <div className="resumen-grid-3">

        {/* Ingresos */}
        <div className="card-resumen-turno border-ingresos">
          <p className="card-label-small">Ingresos</p>
          <div className="card-fila">
            <span>Base Inicial</span>
            <span className="val-white">${baseInicial.toLocaleString()}</span>
          </div>
          <div className="card-fila">
            <span>Ventas (Efectivo)</span>
            <span className="val-green">+${resumen.efectivo.toLocaleString()}</span>
          </div>
          <div className="card-fila">
            <span>Ventas (Nequi)</span>
            <span className="val-blue">${resumen.nequi.toLocaleString()}</span>
          </div>
        </div>

        {/* Egresos */}
        <div className="card-resumen-turno border-egresos">
          <p className="card-label-small">Egresos / Compras</p>
          <div className="card-fila">
            <span>Insumos</span>
            <span className="val-red">-${resumen.insumos.toLocaleString()}</span>
          </div>
          <div className="card-fila">
            <span>Equipos</span>
            <span className="val-red">-${resumen.equipos.toLocaleString()}</span>
          </div>
        </div>

        {/* Total ventas */}
        <div className="card-resumen-turno border-amarillo">
          <p className="card-label-small" style={{ color: 'var(--text-yellow)' }}>Total Ventas</p>
          <p className="monto-grande">${resumen.productos.toLocaleString()}</p>
          <p className="monto-sub">Ventas brutas sin descontar gastos</p>
        </div>

      </div> {/* ← cierre correcto del grid */}

      {/* Tarjeta balance — FUERA del grid */}
      <div className="card-balance-amarilla">
        <p className="bal-label">Efectivo Físico en Caja</p>
        <p className="bal-monto">${resumen.totalAcumulado.toLocaleString()}</p>
        <p className="bal-sub">Monto calculado: (Base + Ventas Efectivo) − Gastos</p>
      </div>

      {/* Botón cierre */}
      <button onClick={ejecutarCierre} className="btn-cerrar-turno">
        Finalizar Jornada y Cerrar Turno
      </button>

    </div>
  );
};

export default CierreCaja;