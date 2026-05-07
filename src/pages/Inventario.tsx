import { useState, useEffect } from "react";
import { useInventario } from "../hooks/inventario";
import "../styles/admin.css";

interface InventarioProps {
  tipo?: string;
}

function Inventario({ tipo = "venta" }: InventarioProps) {
  const { states, setters, actions } = useInventario();

  // 1. Estado local para filtrar solo los insumos que son pulpas
  const [pulpasDisponibles, setPulpasDisponibles] = useState<any[]>([]);

  // 2. Efecto para actualizar el selector de pulpas cada vez que cambie la lista general
  useEffect(() => {
    if (states.lista) {
      const pulpas = states.lista.filter(
        (item: any) => item.tipo === "insumo" && item.subTipo === "pulpa"
      );
      setPulpasDisponibles(pulpas);
    }
  }, [states.lista]);

  const esGestionInterna = tipo === "insumo" || tipo === "equipo";

  // Calculamos la lista con el stock real de las pulpas antes de renderizar
  const listaFiltrada = states.lista
    .filter((item: any) => item.tipo === tipo)
    .map((producto: any) => {
      // Si el producto tiene un vínculo (ej: "Mango") y no es tipo insumo
      if (tipo === "venta" && producto.subTipo && producto.subTipo !== 'general') {
        // Buscamos en la lista completa el insumo que se llame igual al vínculo
        const pulpaVinculada = states.lista.find(
          (insumo: any) => insumo.tipo === "insumo" && insumo.nombre === producto.subTipo
        );

        return {
          ...producto,
          // ✨ El stock ahora es el de la pulpa. Si no hay pulpa, es 0.
          cantidad: pulpaVinculada ? pulpaVinculada.cantidad : 0,
          esVentaConPulpa: true
        };
      }
      return producto;
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
          {/* Nombre del Producto/Insumo */}
          <input
            placeholder={esGestionInterna ? "Nombre del insumo/equipo" : "Nombre del producto (Ej: Jugo de Mango)"}
            value={states.nombre}
            onChange={(e) => setters.setNombre(e.target.value)}
          />

          {/* Costo Unitario */}
          <input
            placeholder={esGestionInterna ? "Costo Unitario ($)" : "Costo ($)"}
            type="number"
            value={states.precioIngreso}
            onChange={(e) => setters.setPrecioIngreso(e.target.value)}
          />

          {/* Cantidad / Stock inicial */}
          <input
            placeholder={esGestionInterna ? "Cantidad (unidades)" : "Stock (Ej: 999)"}
            type="number"
            value={states.cantidad}
            onChange={(e) => setters.setCantidad(e.target.value)}
          />

          {/* SELECTOR DE VINCULACIÓN (Solo para pestaña Venta) */}
          {tipo === "venta" && (
            <div className="flex flex-col">
              <select
                value={states.subTipoInsumo}
                onChange={(e) => setters.setSubTipoInsumo(e.target.value)}
                className="w-full bg-zinc-800 text-white p-2 rounded-md border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="general"> Sin vínculo (Independiente)</option>
                {pulpasDisponibles.map((pulpa) => (
                  <option key={pulpa.id} value={pulpa.nombre}>
                     Vincular a: {pulpa.nombre}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-pink-400 mt-1">
                * Al vender este producto, se restará stock de la pulpa elegida.
              </span>
            </div>
          )}

          {/* Precio de Venta (Solo para productos) */}
          {!esGestionInterna && (
            <input
              placeholder="Precio Venta ($)"
              type="number"
              value={states.precioVenta}
              onChange={(e) => setters.setPrecioVenta(e.target.value)}
            />
          )}

          {/* Opciones de Gestión Interna */}
          {esGestionInterna && (
            <>
              <select
                value={states.metodoPago}
                onChange={(e) => setters.setMetodoPago(e.target.value)}
                className="w-full bg-zinc-800 text-white p-2 rounded-md border border-zinc-700"
              >
                <option value="efectivo">💵 Pago en Efectivo</option>
                <option value="nequi">📱 Pago por Nequi</option>
              </select>

              {tipo === "insumo" && (
                <select
                  value={states.subTipoInsumo}
                  onChange={(e) => setters.setSubTipoInsumo(e.target.value)}
                  className="w-full bg-zinc-800 text-white p-2 rounded-md border border-zinc-700"
                >
                  <option value="general">Insumo General</option>
                  <option value="pulpa">Pulpa de Fruta</option>
                </select>
              )}
            </>
          )}

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
            <button className="btn-cancel" onClick={actions.limpiarFormulario}>
              Cancelar
            </button>
          )}
        </div>
      </section>

      {/* TABLA DE RESULTADOS */}
      <div className="table-container">
        <table className="inventario-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              {esGestionInterna && <th>Cant.</th>}
              <th>Costo Unit.</th>
              {!esGestionInterna && <th>Venta</th>}
              <th>{esGestionInterna ? "Fecha" : "Stock"}</th>
              {!esGestionInterna && <th>Vínculo</th>}
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
                    ) : (
                      "☕"
                    )}
                  </div>
                </td>
                <td className="txt-bold">
                  {item.nombre}
                  {item.subTipo === "pulpa" && (
                    <span className="ml-2 px-2 py-0.5 bg-pink-900 text-pink-200 text-[10px] rounded-full">
                      PULPA
                    </span>
                  )}
                </td>

                {esGestionInterna && (
                  <td>
                    {item.cantidad}
                    {item.esVentaConPulpa && (
                      <span className="text-[10px] block text-pink-400">(de Pulpa)</span>
                    )}
                  </td>)}

                <td>${Number(item.precioIngreso).toLocaleString()}</td>

                {!esGestionInterna && (
                  <td>${Number(item.precioVenta).toLocaleString()}</td>
                )}

                <td>{esGestionInterna ? item.descripcion : item.cantidad}</td>

                {/* Columna de Vínculo: muestra a qué pulpa está atado el producto */}
                {!esGestionInterna && (
                  <td className="text-xs italic text-zinc-400">
                    {item.subTipo !== "general" ? `🔗 ${item.subTipo}` : "---"}
                  </td>
                )}

                <td>
                  <button className="btn-icon" onClick={() => actions.cargarDatosEdicion(item)}>
                    ✏️
                  </button>
                  <button className="btn-icon" onClick={() => actions.eliminarProducto(item.id)}>
                    🗑️
                  </button>
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