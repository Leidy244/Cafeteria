import { useReporte } from "../hooks/reporte";
import "../styles/admin.css";

function Reporte() {
  const { data, calcularTotalVenta } = useReporte();

  return (
    <div className="inventario-container">
      <header className="inventario-header">
        <p>📊 Reporte de Ventas</p>
      </header>

      <div className="table-container">
        <table className="inventario-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad Vendida</th>
              <th>Total Venta</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td className="txt-bold">{item.nombre}</td>
                <td>{item.vendidos}</td>
                <td className="txt-profit">
                  ${calcularTotalVenta(item.nombre, item.vendidos).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reporte;