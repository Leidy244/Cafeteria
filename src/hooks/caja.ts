import { useState, useEffect, useCallback } from "react";
import { showToast } from "../pages/toast";

const API_PRODUCTOS = "http://localhost:3001/productos";
const API_VENTAS = "http://localhost:3001/ventas";
const API_PEDIDOS = "http://localhost:3001/pedidos";

export const useVentas = () => {
    const [productos, setProductos] = useState<any[]>([]);
    const [carrito, setCarrito] = useState<any[]>([]);
    const [mesa, setMesa] = useState<string>("");
    const [pedidosPendientes, setPedidosPendientes] = useState<any[]>([]);
    const [mostrarPendientes, setMostrarPendientes] = useState(false);
    const [mostrarPago, setMostrarPago] = useState(false);
    const [metodoPago, setMetodoPago] = useState<"efectivo" | "nequi">("efectivo");
    const [pasoPagoEfectivo, setPasoPagoEfectivo] = useState(false);
    const [montoRecibido, setMontoRecibido] = useState<string>("");

    const cargarProductos = useCallback(async () => {
        try {
            const res = await fetch(API_PRODUCTOS);
            const data = await res.json();

            const insumos = data.filter((p: any) => p.tipo === "insumo");
            const ventasBase = data.filter((p: any) => p.tipo === "venta");

            const ventasConStockReal = ventasBase.map((producto: any) => {
                const tieneVinculo = producto.subTipo &&
                    producto.subTipo !== 'general' &&
                    producto.subTipo !== 'pulpa';

                if (tieneVinculo) {
                    const pulpaAsociada = insumos.find((i: any) =>
                        i.nombre.toLowerCase().includes(producto.subTipo.toLowerCase())
                    );
                    return {
                        ...producto,
                        cantidad: pulpaAsociada ? pulpaAsociada.cantidad : 0,
                        isVirtual: true,
                        tieneVinculo: true
                    };
                }
                return producto;
            });

            setProductos(ventasConStockReal);
        } catch (error) {
            console.error("Error cargando productos:", error);
            showToast("Error al cargar los productos", "error");
        }
    }, []);

    const cargarPedidosDesdeDB = useCallback(async () => {
        try {
            const res = await fetch(API_PEDIDOS);
            if (res.ok) {
                const data = await res.json();
                setPedidosPendientes(data);
            }
        } catch (error) {
            console.error("Error cargando pedidos:", error);
            showToast("Error al cargar pedidos pendientes", "error");
        }
    }, []);

    useEffect(() => {
        cargarProductos();
        cargarPedidosDesdeDB();
    }, [cargarProductos, cargarPedidosDesdeDB]);

    // ── HELPER: stock disponible real descontando lo que ya está en carrito ──
    const stockDisponible = (producto: any): number => {
        const cantidadEnCarrito = carrito.filter(item => item.id === producto.id).length;
        return producto.cantidad - cantidadEnCarrito;
    };

    // --- LÓGICA DE CARRITO ---
    const agregarAlCarrito = (producto: any) => {
        // Sin stock en absoluto
        if (producto.cantidad <= 0) {
            showToast(`⚠️ Sin stock disponible de ${producto.nombre}.`, "warning");
            return;
        }

        // Stock disponible considerando lo ya agregado al carrito
        const disponible = stockDisponible(producto);
        if (disponible <= 0) {
            showToast(`⚠️ No hay más stock disponible de ${producto.nombre}.`, "warning");
            return;
        }

        setCarrito([...carrito, { ...producto }]);
        showToast(`${producto.nombre} agregado al carrito`, "success");
    };

    const cambiarCantidad = (id: number, delta: number) => {
        if (delta > 0) {
            const productoOriginal = productos.find(p => p.id === id);

            if (!productoOriginal) return;

            // Bloqueamos siempre, tanto vinculados a pulpa como normales
            const cantidadEnCarrito = carrito.filter(item => item.id === id).length;
            if (cantidadEnCarrito >= productoOriginal.cantidad) {
                showToast(
                    `⚠️ Solo hay ${productoOriginal.cantidad} unidades disponibles de ${productoOriginal.nombre}.`,
                    "warning"
                );
                return;
            }

            setCarrito([...carrito, { ...productoOriginal }]);
        } else {
            const nuevoCarrito = [...carrito];
            const index = nuevoCarrito.findIndex(item => item.id === id);
            if (index !== -1) {
                nuevoCarrito.splice(index, 1);
                setCarrito(nuevoCarrito);
            }
        }
    };

    const removerProducto = (id: number) => {
        const productoRemovido = carrito.find(item => item.id === id);
        setCarrito(carrito.filter(item => item.id !== id));
        if (productoRemovido) {
            showToast(`${productoRemovido.nombre} eliminado del carrito`, "info");
        }
    };

    // --- CÁLCULOS ---
    const total = carrito.reduce((acc, item) => acc + item.precioVenta, 0);
    const vuelto = montoRecibido ? Number(montoRecibido) - total : 0;

    // --- GESTIÓN DE PEDIDOS ---
    const guardarPedido = async () => {
        if (!mesa) {
            showToast("Asigna una mesa antes de guardar.", "warning");
            return;
        }
        if (carrito.length === 0) {
            showToast("El carrito está vacío.", "warning");
            return;
        }

        const carritoAgrupado = carrito.reduce((acc: any[], item: any) => {
            const existente = acc.find((p) => p.id === item.id);
            if (existente) {
                existente.cantidad += 1;
            } else {
                acc.push({ ...item, cantidad: 1 });
            }
            return acc;
        }, []);

        const pedidoExistente = pedidosPendientes.find(p => String(p.mesa) === String(mesa));

        try {
            if (pedidoExistente) {
                const res = await fetch(`${API_PEDIDOS}/${pedidoExistente.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...pedidoExistente,
                        carrito: carritoAgrupado,
                        total: total,
                        estado: "pendiente"
                    })
                });
                if (res.ok) {
                    showToast(`Mesa ${mesa} actualizada a $${total.toLocaleString()}`, "success");
                } else {
                    showToast("Error al actualizar el pedido", "error");
                }
            } else {
                const res = await fetch(API_PEDIDOS, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        mesa,
                        total,
                        carrito: carritoAgrupado,
                        estado: "pendiente"
                    })
                });
                if (res.ok) {
                    showToast(`Pedido guardado para mesa ${mesa} ✅`, "success");
                } else {
                    showToast("Error al guardar el pedido", "error");
                }
            }

            setCarrito([]);
            setMesa("");
            await cargarPedidosDesdeDB();
            await cargarProductos();
        } catch (error) {
            console.error("Error en guardarPedido:", error);
            showToast("Error de conexión al guardar el pedido", "error");
        }
    };

    const cargarPedido = (pedido: any) => {
        const carritoReconstruido: any[] = [];
        pedido.carrito.forEach((item: any) => {
            for (let i = 0; i < item.cantidad; i++) {
                carritoReconstruido.push({ ...item });
            }
        });

        setCarrito(carritoReconstruido);
        setMesa(pedido.mesa);
        setMostrarPendientes(false);
        showToast(`Pedido de mesa ${pedido.mesa} cargado`, "success");
    };

    // --- PROCESAR VENTA FINAL ---
    const procesarPago = async (metodo: "efectivo" | "nequi") => {
        try {
            const resCaja = await fetch("http://localhost:3001/caja/estado");
            const cajaActiva = await resCaja.json();

            if (!cajaActiva || cajaActiva.estado !== "abierto") {
                showToast("⚠️ La caja debe estar ABIERTA para procesar ventas.", "warning");
                return;
            }

            if (carrito.length === 0) {
                showToast("El carrito está vacío. Agrega productos antes de pagar.", "warning");
                return;
            }

            const carritoAgrupado = carrito.reduce((acc: any[], item: any) => {
                const existente = acc.find((p) => p.id === item.id);
                if (existente) {
                    existente.cantidad += 1;
                } else {
                    acc.push({ ...item, cantidad: 1 });
                }
                return acc;
            }, []);

            const ventaData = {
                carrito: carritoAgrupado,
                total,
                mesa,
                metodoPago: metodo,
                turnoId: cajaActiva.id,
                montoRecibido: metodo === "efectivo" ? Number(montoRecibido) : total
            };

            const res = await fetch(API_VENTAS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ventaData)
            });

            if (res.ok) {
                const pedidoActual = pedidosPendientes.find(p => p.mesa === mesa);
                if (pedidoActual) {
                    await fetch(`${API_PEDIDOS}/${pedidoActual.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            ...pedidoActual,
                            estado: "pagado"
                        })
                    });
                }

                showToast(`✅ Venta procesada con éxito por ${metodo === "efectivo" ? "Efectivo" : "Nequi"}`, "success");

                setCarrito([]);
                setMesa("");
                setMostrarPago(false);
                setPasoPagoEfectivo(false);
                setMontoRecibido("");

                await cargarProductos();
                await cargarPedidosDesdeDB();
            } else {
                const errorData = await res.json();
                showToast(errorData.error || "Error al procesar la venta", "error");
            }
        } catch (error) {
            console.error("Error en procesarPago:", error);
            showToast("❌ Error de conexión al procesar la venta", "error");
        }
    };

    const productosOrdenados = [...productos].sort((a, b) => {
        const aAgotado = a.cantidad <= 0;
        const bAgotado = b.cantidad <= 0;
        if (aAgotado && !bAgotado) return 1;
        if (!aAgotado && bAgotado) return -1;
        return 0;
    });

    return {
        productos: productosOrdenados,
        carrito,
        setCarrito,
        mesa,
        pedidosPendientes,
        mostrarPendientes,
        mostrarPago,
        metodoPago,
        pasoPagoEfectivo,
        montoRecibido,
        total,
        vuelto,
        setMesa,
        setMostrarPendientes,
        setMostrarPago,
        setMetodoPago,
        setPasoPagoEfectivo,
        setMontoRecibido,
        agregarAlCarrito,
        removerProducto,
        cambiarCantidad,
        guardarPedido,
        cargarPedido,
        procesarPago
    };
};