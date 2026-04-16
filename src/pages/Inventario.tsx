import { useInventario } from "../hooks/inventario";
import "../styles/admin.css";

interface InventarioProps {
  tipo?: string; // "venta", "insumo", "equipo"
}

function Inventario({ tipo = "venta" }: InventarioProps) {
  const { states, setters, actions } = useInventario();

  // Gestión interna = Insumos o Equipos (Solo pide Nombre, Precio, Fecha e Imagen)
  const esGestionInterna = tipo === "insumo" || tipo === "equipo";

  // Solo mostramos si el tipo coincide EXACTAMENTE con la pestaña activa
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
          <input 
            placeholder={esGestionInterna ? "Nombre del insumo/equipo" : "Nombre del producto"} 
            value={states.nombre} 
            onChange={(e) => setters.setNombre(e.target.value)} 
          />

          <input 
            placeholder={esGestionInterna ? "Costo de compra ($)" : "Costo ($)"} 
            type="number" 
            value={states.precioIngreso} 
            onChange={(e) => setters.setPrecioIngreso(e.target.value)} 
          />

          {!esGestionInterna && (
            <>
              <input 
                placeholder="Precio Venta ($)" 
                type="number" 
                value={states.precioVenta} 
                onChange={(e) => setters.setPrecioVenta(e.target.value)} 
              />
              <input 
                placeholder="Stock inicial" 
                type="number" 
                value={states.cantidad} 
                onChange={(e) => setters.setCantidad(e.target.value)} 
              />
            </>
          )}

          {/* Campo de Fecha (Usando el estado descripcion) */}
          {esGestionInterna && (
            <input 
              type="date" 
              className="input-fecha"
              value={states.descripcion} 
              onChange={(e) => setters.setDescripcion(e.target.value)} 
            />
          )}

          {!esGestionInterna && (
            <input 
              placeholder="Descripción corta" 
              value={states.descripcion} 
              onChange={(e) => setters.setDescripcion(e.target.value)} 
            />
          )}
          
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
              <th>Costo</th>
              {!esGestionInterna && <th>Venta</th>}
              {esGestionInterna ? <th>Fecha</th> : <th>Stock</th>}
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
                <td>${Number(item.precioIngreso).toLocaleString()}</td>
                {!esGestionInterna && <td>${Number(item.precioVenta).toLocaleString()}</td>}
                
                {esGestionInterna ? (
                  <td>{item.descripcion}</td> 
                ) : (
                  <td>{item.cantidad}</td>
                )}

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