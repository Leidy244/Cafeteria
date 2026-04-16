// Caja.tsx
import { useCaja } from "../hooks/caja"; // Asegúrate de que la ruta sea correcta
import "../styles/caja.css";

function Caja() {
    const props = useCaja();

    // Helper para agrupar productos repetidos en la tabla visual
    const carritoAgrupado = () => {
        const agrupado: any[] = [];
        props.carrito.forEach(item => {
            const ex = agrupado.find(p => p.id === item.id);
            if (ex) {
                ex.cantidad++;
            } else {
                agrupado.push({ ...item, cantidad: 1 });
            }
        });
        return agrupado;
    };

    return (
        <div className="contenedor">
            <h1 className="titulo">Juyasia ☕🍦</h1>

            {/* SECCIÓN DE PEDIDOS PENDIENTES */}
            <button 
                className="btn-pendientes-toggle" 
                onClick={() => props.setMostrarPendientes(!props.mostrarPendientes)}
            >
                📦 Pedidos Guardados ({props.pedidosPendientes.length})
            </button>

            {props.mostrarPendientes && (
                <div className="pendientes-container">
                    <div className="pendientes-grid">
                        {props.pedidosPendientes.length === 0 ? (
                            <p>No hay pedidos pendientes</p>
                        ) : (
                            props.pedidosPendientes.map(p => (
                                <div key={p.id} className="pendiente-card">
                                    <strong>Mesa {p.mesa} - ${p.total.toLocaleString()}</strong>
                                    <button onClick={() => props.cargarPedido(p)}>📥 Cargar</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ENTRADA DE MESA */}
            <div className="mesa-input-container">
                <label>🪑 Mesa:</label>
                <input 
                    type="number" 
                    value={props.mesa} 
                    onChange={(e) => props.setMesa(e.target.value)} 
                    className="input-mesa"
                    placeholder="0"
                />
            </div>

            {/* CATÁLOGO DE PRODUCTOS */}
            <div className="productos-grid">
                {props.productos.map(p => (
                    <div key={p.id} className={`producto-card ${p.cantidad <= 0 ? 'sin-stock' : ''}`}>
                        <strong>{p.nombre}</strong>
                        <span>${p.precioVenta.toLocaleString()}</span>
                        <button 
                            disabled={p.cantidad <= 0} 
                            onClick={() => props.agregarAlCarrito(p)}
                        >
                            {p.cantidad <= 0 ? "Agotado" : "Agregar"}
                        </button>
                    </div>
                ))}
            </div>

            {/* RESUMEN DEL CARRITO */}
            {props.carrito.length > 0 && (
                <div className="carrito-container">
                    <table className="tabla-carrito">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cant.</th>
                                <th>Subtotal</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carritoAgrupado().map(item => (
                                <tr key={item.id}>
                                    <td>{item.nombre}</td>
                                    <td>
                                        <div className="controles-cantidad">
                                            <button onClick={() => props.cambiarCantidad(item.id, -1)}>-</button>
                                            <span className="cantidad-numero">{item.cantidad}</span>
                                            <button onClick={() => props.cambiarCantidad(item.id, 1)}>+</button>
                                        </div>
                                    </td>
                                    <td>${(item.precioVenta * item.cantidad).toLocaleString()}</td>
                                    <td>
                                        <button className="btn-eliminar" onClick={() => props.removerProducto(item.id)}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <div className="total-seccion">
                        <h2>Total: ${props.total.toLocaleString()}</h2>
                    </div>

                    <div className="botones-accion">
                        <button onClick={props.guardarPedido} className="btn-listo">💾 Guardar Pedido</button>
                        <button onClick={() => props.setMostrarPago(true)} className="btn-pagar">💰 Ir a Pagar</button>
                    </div>
                </div>
            )}

            {/* MODAL DE PROCESAMIENTO DE PAGO */}
            {props.mostrarPago && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="btn-cerrar-modal" onClick={() => props.setMostrarPago(false)}>X</button>
                        <h2>Resumen de Pago</h2>
                        <p className="total-modal">Monto a cobrar: <strong>${props.total.toLocaleString()}</strong></p>
                        
                        {!props.pasoPagoEfectivo ? (
                            <div className="metodos-pago">
                                <p>Seleccione método:</p>
                                <button 
                                    className="btn-metodo efectivo"
                                    onClick={() => { 
                                        props.setMetodoPago("efectivo"); 
                                        props.setPasoPagoEfectivo(true); 
                                    }}
                                >
                                    💵 Efectivo
                                </button>
                                
                                <button 
                                    className="btn-metodo nequi"
                                    onClick={() => props.procesarPago("nequi")} // Envío directo de "nequi"
                                >
                                    📱 Nequi
                                </button>
                                
                                <button className="btn-cancelar" onClick={() => props.setMostrarPago(false)}>Cancelar</button>
                            </div>
                        ) : (
                            <div className="pago-efectivo-detalles">
                                <label>Monto recibido:</label>
                                <input 
                                    type="number" 
                                    placeholder="Ej: 20000" 
                                    value={props.montoRecibido} 
                                    onChange={(e) => props.setMontoRecibido(e.target.value)}
                                    autoFocus
                                    className="input-pago"
                                />
                                
                                <div className="vuelto-container">
                                    <p>Vuelto:</p>
                                    <h3 className={props.vuelto < 0 ? "vuelto-negativo" : "vuelto-positivo"}>
                                        ${props.vuelto.toLocaleString()}
                                    </h3>
                                </div>

                                <div className="botones-finales">
                                    <button 
                                        className="btn-confirmar"
                                        onClick={() => props.procesarPago("efectivo")} // Envío directo de "efectivo"
                                        disabled={props.vuelto < 0 || !props.montoRecibido}
                                    >
                                        ✅ Confirmar Venta
                                    </button>
                                    <button className="btn-atras" onClick={() => props.setPasoPagoEfectivo(false)}>Atrás</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Caja;