import { useInventario } from "../hooks/inventario";
import "../styles/admin.css";

interface InventarioProps {
  tipo?: string;
}

function Inventario({ tipo = "venta" }: InventarioProps) {
  const { states, setters, actions } = useInventario();

  // Determinamos si es Insumo o Equipo
  const esGestionInterna = tipo === "insumo" || tipo === "equipo";

  // Filtramos la lista según la pestaña activa
  const listaFiltrada = states.lista.filter((item) => {
    return item.tipo !== null && item.tipo !== undefined && item.tipo === tipo;
  });

  return (
    <div className="inventario-container">
      <header className="inventario-header">
        <p>
          {tipo === "venta" && "🛒 Panel de Control de Productos"}
          {tipo === "insumo" && "☕ Registro de Insumos Cafetería"}
          {tipo === "equipo" && "🔌 Inventario de Equipos y Materiales"}
        </p>
      </header>

      <section className="form-card">
        <div className="grid-form">
          {/* Nombre */}
          <input 
            placeholder={esGestionInterna ? "Nombre del insumo/equipo" : "Nombre del producto"} 
            value={states.nombre} 
            onChange={(e) => setters.setNombre(e.target.value)} 
          />

          {/* Costo */}
          <input 
            placeholder={esGestionInterna ? "Costo Unitario ($)" : "Costo ($)"} 
            type="number" 
            value={states.precioIngreso} 
            onChange={(e) => setters.setPrecioIngreso(e.target.value)} 
          />

          {/* Cantidad / Stock: Es el mismo campo pero con diferente placeholder */}
          <input 
            placeholder={esGestionInterna ? "Cantidad (unidades)" : "Stock inicial"} 
            type="number" 
            value={states.cantidad} 
            onChange={(e) => setters.setCantidad(e.target.value)} 
          />

          {/* Precio de Venta: Solo para productos de venta */}
          {!esGestionInterna && (
            <input 
              placeholder="Precio Venta ($)" 
              type="number" 
              value={states.precioVenta} 
              onChange={(e) => setters.setPrecioVenta(e.target.value)} 
            />
          )}

          {/* Fecha (Insumos/Equipos) o Descripción (Ventas) */}
          <input 
            type={esGestionInterna ? "date" : "text"} 
            placeholder={esGestionInterna ? "" : "Descripción corta"} 
            className={esGestionInterna ? "input-fecha" : ""}
            value={states.descripcion} 
            onChange={(e) => setters.setDescripcion(e.target.value)} 
          />
          
          <div className="file-input-wrapper">
            <label>🖼️ Imagen:</label>
            <input 
              id="fileInput"
              type="file" 
              accept="image/*" 
              onChange={(e) => setters.setImagen(e.target.files?.[0] || null)} 
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-save" onClick={() => actions.guardarProducto(tipo)}>
            {states.editandoId ? "Actualizar" : "Registrar"}
          </button>
          {states.editandoId && (
            <button className="btn-cancel" onClick={actions.limpiarFormulario}>Cancelar</button>
          )}
        </div>
      </section>

      <div className="table-container">
        <table className="inventario-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              {/* Condicional: Cantidad solo para gestión interna */}
              {esGestionInterna && <th>Cant.</th>}
              <th>Costo Unit.</th>
              {!esGestionInterna && <th>Venta</th>}
              {/* Título dinámico: Fecha o Stock */}
              <th>{esGestionInterna ? "Fecha" : "Stock"}</th>
              {!esGestionInterna && <th>Ganancia</th>}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.map((item: any) => (
              <tr key={item.id}>
                <td className="td-imagen">
                  <div className="thumb-container">
                    {item.imagen ? (
                      <img src={`http://localhost:3001${item.imagen}`} alt={item.nombre} />
                    ) : "☕"}
                  </div>
                </td>
                <td className="txt-bold">{item.nombre}</td>
                
                {/* Celda de Cantidad solo para gestión interna */}
                {esGestionInterna && (
                  <td style={{ fontWeight: 'bold', color: '#ff007a' }}>x{item.cantidad || 0}</td>
                )}

                <td>${Number(item.precioIngreso).toLocaleString()}</td>
                
                {!esGestionInterna && <td>${Number(item.precioVenta).toLocaleString()}</td>}

                {/* Valor dinámico: Fecha (guardada en descripcion) o Cantidad (Stock) */}
                <td>{esGestionInterna ? item.descripcion : item.cantidad}</td>

                {!esGestionInterna && (
                  <td className="txt-profit">
                    ${(Number(item.precioVenta) - Number(item.precioIngreso)).toLocaleString()}
                  </td>
                )}

                <td>
                  <button className="btn-icon" onClick={() => actions.cargarDatosEdicion(item)}>✏️</button>
                  <button className="btn-icon" onClick={() => actions.eliminarProducto(item.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Inventario;