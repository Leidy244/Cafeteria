import { useReporte } from "../hooks/reporte";
import "../styles/admin.css";

function Reporte() {
  const { data, exportarExcel } = useReporte() as {
    data: {
      ventas: any[],
      gastos: any[],
      totalVentas: number,
      totalGastos: number,
      utilidadNeta: number
    },
    exportarExcel: () => void
  };

  if (!data) return (
    <div className="caja-centrada-wrapper">
      <div className="loader-spinner"></div>
      <p className="text-muted" style={{ marginTop: '16px' }}>Cargando reporte...</p>
    </div>
  );

  const esPositivo = data.utilidadNeta >= 0;

  return (
    <div className="inventario-container">
      <header className="reporte-header">
        <div className="reporte-header-title">
          <div className="reporte-header-icon">📊</div>
          <div>
            <h2>Reporte de Gestión</h2>
            <span>Resumen de ingresos, egresos y utilidad neta</span>
          </div>
        </div>
        <button onClick={exportarExcel} className="btn-excel">
          📥 Descargar Excel
        </button>
      </header>

      <div className="reporte-completo">

        {/* ── VENTAS ── */}
        <div className="reporte-section">
          <h3 className="reporte-section-titulo reporte-section-titulo--verde">
            💰 Resumen de Ventas
          </h3>
          <div className="table-container" style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', border: 'none' }}>
            <table className="tabla-reporte">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Método</th>
                  <th>Cant.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.ventas?.length > 0 ? (
                  data.ventas.map((v: any, i: number) => (
                    <tr key={i}>
                      <td className="txt-bold">{v.nombre}</td>
                      <td>
                        {(v.metodoPago?.toLowerCase() === 'nequi' || v.metodo_pago?.toLowerCase() === 'nequi') ? (
                          <span className="badge-metodo badge-nequi">Nequi</span>
                        ) : (
                          <span className="badge-metodo badge-efectivo">Efectivo</span>
                        )}
                      </td>
                      <td>
                        <span className="badge-cantidad">{v.cant}</span>
                      </td>
                      <td className="val-green">
                        ${(Number(v.subtotal) || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="empty-cell">No hay ventas registradas en este turno</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── GASTOS ── */}
        <div className="reporte-section">
          <h3 className="reporte-section-titulo reporte-section-titulo--rojo">
            🧾 Detalle de Gastos (Egresos)
          </h3>
          <div className="table-container" style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', border: 'none' }}>
            <table className="tabla-reporte">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Método</th>
                  <th>Tipo</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {data.gastos?.length > 0 ? (
                  data.gastos.map((g: any, i: number) => (
                    <tr key={i}>
                      <td className="txt-bold">
                        {(g.nombre || "Gasto sin nombre").replace("COMPRA: ", "")}
                      </td>
                      <td>
                        {(g.metodoPago?.toLowerCase() === 'nequi' || g.metodo_pago?.toLowerCase() === 'nequi') ? (
                          <span className="badge-metodo badge-nequi">📱 Nequi</span>
                        ) : (
                          <span className="badge-metodo badge-efectivo">💵 Efectivo</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge-tipo badge-tipo--${g.tipo}`}>
                          {g.tipo?.toUpperCase()}
                        </span>
                      </td>
                      <td className="val-red">
                        -${(Number(g.total || g.monto) || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="empty-cell">No hay gastos registrados en este turno</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── BALANCE FINAL ── */}
        <div className={`card-balance-final ${esPositivo ? 'balance--positivo' : 'balance--negativo'}`}>
          <div className="balance-fila">
            <span>Total Ventas</span>
            <span className="val-green">${(Number(data.totalVentas) || 0).toLocaleString()}</span>
          </div>
          <div className="balance-fila">
            <span>Total Gastos</span>
            <span className="val-red">-${(Number(data.totalGastos) || 0).toLocaleString()}</span>
          </div>
          <div className="balance-divider"></div>
          <div className="balance-fila balance-fila--total">
            <span>Ganancia Real</span>
            <span className={esPositivo ? 'val-green' : 'val-red'}>
              ${(Number(data.utilidadNeta) || 0).toLocaleString()}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Reporte;