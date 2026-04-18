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

        {/* INGRESOS */}
        <div className="reporte-section">
          <h3 className="reporte-section-titulo reporte-section-titulo--verde">
            💰 Resumen de Ventas
          </h3>
          <table className="tabla-reporte">
            <thead>
              <tr><th>Producto</th><th>Cant.</th><th>Total</th></tr>
            </thead>
            <tbody>
              {data.ventas?.map((v: any, i: number) => (
                <tr key={i}>
                  <td>{v.nombre}</td>
                  {/* v.cant ahora tendrá la suma total de galletas vendidas */}
                  <td><span className="badge-cantidad">{v.cant}</span></td>
                  <td className="val-green">
                    ${(Number(v.subtotal) || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EGRESOS */}
        {/* SECCIÓN 2: EGRESOS (INSUMOS Y EQUIPOS) */}
        <div className="reporte-section" style={{ marginTop: '25px' }}>
          <h3 style={{ color: '#ff4d4d' }}>💸 Detalle de Gastos (Egresos)</h3>
          <table className="tabla-reporte">
            <thead>
              <tr>
                <th>NOMBRE</th> {/* Cabecera actualizada a NOMBRE */}
                <th>TIPO</th>
                <th>MONTO</th>
              </tr>
            </thead>
            <tbody>
              {data.gastos?.length > 0 ? (
                data.gastos.map((g: any, i: number) => (
                  <tr key={i}>
                    {/* Usamos g.nombre para mostrar el nombre específico */}
                    <td className="txt-bold">{g.nombre || "Gasto sin nombre"}</td>
                    <td>
                      <span className={`badge ${g.tipo}`}>
                        {g.tipo.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ color: '#ff4d4d', fontWeight: 'bold' }}>
                      -${Number(g.monto).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3}>No hay gastos registrados en este turno</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* BALANCE FINAL */}
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