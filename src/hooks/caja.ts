import { useState, useEffect, useCallback, useRef } from 'react';
import type { Producto, CarritoItem, Pedido } from '../types';
import { productService, ordersService, salesService } from '../services';
import { useToast } from '../contexts';

export const useVentas = () => {
  const { showToast } = useToast();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [mesa, setMesa] = useState('');
  const [pedidosPendientes, setPedidosPendientes] = useState<Pedido[]>([]);
  const [mostrarPendientes, setMostrarPendientes] = useState(false);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'nequi'>('efectivo');
  const [pasoPagoEfectivo, setPasoPagoEfectivo] = useState(false);
  const [montoRecibido, setMontoRecibido] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const cargarProductos = useCallback(async () => {
    try {
      const data = await productService.getAll();
      if (!mountedRef.current) return;
      const insumos = data.filter((p) => p.tipo === 'insumo');
      const ventas = data.filter((p) => p.tipo === 'venta').map((producto) => {
        const tieneVinculo = producto.subTipo && producto.subTipo !== 'general' && producto.subTipo !== 'pulpa';
        if (tieneVinculo) {
          const pulpa = insumos.find((i) =>
            i.nombre.toLowerCase().includes(producto.subTipo.toLowerCase())
          );
          return { ...producto, cantidad: pulpa ? pulpa.cantidad : 0 };
        }
        return producto;
      });
      setProductos(ventas);
    } catch {
      showToast('Error al cargar los productos', 'error');
    }
  }, [showToast]);

  const cargarPedidosDesdeDB = useCallback(async () => {
    try {
      const data = await ordersService.getAll();
      if (mountedRef.current) setPedidosPendientes(data);
    } catch {
      showToast('Error al cargar pedidos pendientes', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    cargarProductos();
    cargarPedidosDesdeDB();
  }, [cargarProductos, cargarPedidosDesdeDB]);

  const stockDisponible = useCallback(
    (producto: Producto): number => {
      const enCarrito = carrito.filter((item) => item.id === producto.id).length;
      return producto.cantidad - enCarrito;
    },
    [carrito]
  );

  const agregarAlCarrito = useCallback(
    (producto: Producto) => {
      if (producto.cantidad <= 0) {
        showToast(`Sin stock disponible de ${producto.nombre}.`, 'warning');
        return;
      }
      if (stockDisponible(producto) <= 0) {
        showToast(`No hay más stock disponible de ${producto.nombre}.`, 'warning');
        return;
      }
      setCarrito((prev) => [...prev, { ...producto }]);
      showToast(`${producto.nombre} agregado al carrito`, 'success');
    },
    [stockDisponible, showToast]
  );

  const cambiarCantidad = useCallback(
    (id: number, delta: number) => {
      if (delta > 0) {
        const producto = productos.find((p) => p.id === id);
        if (!producto) return;
        const enCarrito = carrito.filter((item) => item.id === id).length;
        if (enCarrito >= producto.cantidad) {
          showToast(`Solo hay ${producto.cantidad} unidades disponibles de ${producto.nombre}.`, 'warning');
          return;
        }
        setCarrito((prev) => [...prev, { ...producto }]);
      } else {
        setCarrito((prev) => {
          const idx = prev.findIndex((item) => item.id === id);
          if (idx === -1) return prev;
          const next = [...prev];
          next.splice(idx, 1);
          return next;
        });
      }
    },
    [productos, carrito, showToast]
  );

  const removerProducto = useCallback(
    (id: number) => {
      const item = carrito.find((i) => i.id === id);
      setCarrito((prev) => prev.filter((i) => i.id !== id));
      if (item) showToast(`${item.nombre} eliminado del carrito`, 'info');
    },
    [carrito, showToast]
  );

  const total = carrito.reduce((acc, item) => acc + item.precioVenta, 0);
  const vuelto = montoRecibido ? Number(montoRecibido) - total : 0;

  const agruparCarrito = useCallback((items: CarritoItem[]) => {
    const map = new Map<number, CarritoItem>();
    items.forEach((item) => {
      const existing = map.get(item.id);
      if (existing) {
        existing.cantidad += 1;
      } else {
        map.set(item.id, { ...item, cantidad: 1 });
      }
    });
    return Array.from(map.values());
  }, []);

  const guardarPedido = useCallback(async () => {
    if (!mesa) { showToast('Asigna una mesa antes de guardar.', 'warning'); return; }
    if (carrito.length === 0) { showToast('El carrito está vacío.', 'warning'); return; }

    const agrupado = agruparCarrito(carrito);
    const pedidoExistente = pedidosPendientes.find((p) => String(p.mesa) === String(mesa));

    try {
      if (pedidoExistente) {
        const carritoCombinado = [...(pedidoExistente.carrito || [])];
        agrupado.forEach((nuevo) => {
          const existente = carritoCombinado.find((i) => i.id === nuevo.id);
          if (existente) existente.cantidad += nuevo.cantidad;
          else carritoCombinado.push({ ...nuevo });
        });
        const nuevoTotal = carritoCombinado.reduce((sum, item) => {
          const prod = productos.find((p) => p.id === item.id);
          return sum + (prod?.precioVenta || 0) * item.cantidad;
        }, 0);
        const ok = await ordersService.update(pedidoExistente.id, {
          ...pedidoExistente, carrito: carritoCombinado, total: nuevoTotal, estado: 'pendiente',
        });
        if (ok) showToast(`Mesa ${mesa} actualizada a $${nuevoTotal.toLocaleString()}`, 'success');
        else showToast('Error al actualizar el pedido', 'error');
      } else {
        const result = await ordersService.create({
          mesa, total, carrito: agrupado, estado: 'pendiente',
        });
        if (result) showToast(`Pedido guardado para mesa ${mesa}`, 'success');
        else showToast('Error al guardar el pedido', 'error');
      }
      setCarrito([]);
      setMesa('');
      await cargarPedidosDesdeDB();
      await cargarProductos();
    } catch {
      showToast('Error de conexión al guardar el pedido', 'error');
    }
  }, [mesa, carrito, pedidosPendientes, productos, agruparCarrito, cargarPedidosDesdeDB, cargarProductos, showToast]);

  const cargarPedido = useCallback(
    (pedido: Pedido) => {
      const reconstruido: CarritoItem[] = [];
      pedido.carrito.forEach((item) => {
        for (let i = 0; i < item.cantidad; i++) reconstruido.push({ ...item });
      });
      setCarrito(reconstruido);
      setMesa(String(pedido.mesa));
      setMostrarPendientes(false);
      showToast(`Pedido de mesa ${pedido.mesa} cargado`, 'success');
    },
    [showToast]
  );

  const procesarPago = useCallback(
    async (metodo: 'efectivo' | 'nequi') => {
      try {
        const cajaActiva = await salesService.checkCajaAbierta();
        if (!cajaActiva || cajaActiva.estado !== 'abierto') {
          showToast('La caja debe estar ABIERTA para procesar ventas.', 'warning');
          return;
        }
        if (carrito.length === 0) {
          showToast('El carrito está vacío. Agrega productos antes de pagar.', 'warning');
          return;
        }

        const ok = await salesService.create({
          carrito: agruparCarrito(carrito),
          total, mesa, metodoPago: metodo, turnoId: cajaActiva.id,
          montoRecibido: metodo === 'efectivo' ? Number(montoRecibido) : total,
        });

        if (ok) {
          const pedidoActual = pedidosPendientes.find((p) => p.mesa === mesa);
          if (pedidoActual) await ordersService.update(pedidoActual.id, { ...pedidoActual, estado: 'pagado' });
          showToast(`Venta procesada con éxito por ${metodo === 'efectivo' ? 'Efectivo' : 'Nequi'}`, 'success');
          setCarrito([]);
          setMesa('');
          setMostrarPago(false);
          setPasoPagoEfectivo(false);
          setMontoRecibido('');
          await cargarProductos();
          await cargarPedidosDesdeDB();
        } else {
          showToast('Error al procesar la venta', 'error');
        }
      } catch {
        showToast('Error de conexión al procesar la venta', 'error');
      }
    },
    [carrito, total, mesa, montoRecibido, pedidosPendientes, agruparCarrito, cargarProductos, cargarPedidosDesdeDB, showToast]
  );

  const productosOrdenados = [...productos].sort((a, b) => {
    if (a.cantidad <= 0 && b.cantidad > 0) return 1;
    if (a.cantidad > 0 && b.cantidad <= 0) return -1;
    return 0;
  });

  return {
    productos: productosOrdenados, carrito, setCarrito, mesa, pedidosPendientes,
    mostrarPendientes, mostrarPago, metodoPago, pasoPagoEfectivo, montoRecibido,
    total, vuelto, setMesa, setMostrarPendientes, setMostrarPago, setMetodoPago,
    setPasoPagoEfectivo, setMontoRecibido, agregarAlCarrito, removerProducto,
    cambiarCantidad, guardarPedido, cargarPedido, procesarPago,
  };
};
