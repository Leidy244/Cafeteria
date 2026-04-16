import React, { useState } from 'react';
import { useCaja } from '../hooks/cierrecaja'; 
import '../styles/admin.css';

const CierreCaja: React.FC = () => {
  const { cajaInfo, resumen, cargando, abrirCaja, cerrarCaja, refrescar } = useCaja();
  const [inputBase, setInputBase] = useState<string>("");

  // 1. Pantalla de carga
  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <p className="mt-4 text-gray-500">Verificando estado de caja...</p>
      </div>
    );
  }

  // 2. Manejador para Abrir Caja
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
        <div className="text-center mb-8">
          <span className="text-6xl">🏪</span>
          <h2 className="titulo-principal mt-4 text-2xl font-bold">NUEVO TURNO</h2>
          <p className="text-gray-400 mt-2">No hay turno activo. Ingresa la base inicial.</p>
        </div>
        
        <div className="form-card max-w-sm w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
          <input
            type="number"
            className="w-full p-3 border rounded mb-4 text-center text-xl"
            placeholder="$ Monto base"
            value={inputBase}
            onChange={(e) => setInputBase(e.target.value)}
            autoFocus
          />
          <button onClick={handleAbrir} className="btn-save w-full bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700">
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
      const resultado = await cerrarCaja(cajaInfo.id, resumen.totalAcumulado);
      if (resultado.success) {
        alert("✅ Turno cerrado exitosamente.");
      } else {
        alert("❌ Error: " + (resultado.msg || "No se pudo cerrar"));
      }
    }
  };

  return (
    <div className="main-content w-full p-4 fade-in-up">
      {/* Cabecera */}
      <div className="inventario-header flex justify-between items-center mb-8 bg-gray-900 p-6 rounded-lg text-white">
        <div>
          <h1 className="text-2xl font-bold text-green-400">💰 Control de Turno</h1>
          <p className="text-sm opacity-75">ID #{cajaInfo.id} | Abierta: {new Date(cajaInfo.fechaApertura).toLocaleTimeString()}</p>
        </div>
        <button onClick={refrescar} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">🔄</button>
      </div>

      {/* Cuadrícula de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Ingresos */}
        <div className="card-resumen border-l-4 border-green-500 bg-gray-800 p-5 rounded-lg shadow">
          <p className="text-xs text-gray-400 uppercase font-bold mb-3">Ingresos</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Base Inicial</span>
              <span className="text-white">${baseInicial.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Ventas (Efectivo)</span>
              <span className="text-green-400 font-bold">+${resumen.efectivo.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-700 pt-2">
              <span className="text-gray-300">Ventas (Nequi)</span>
              <span className="text-blue-400 font-bold">${resumen.nequi.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Egresos */}
        <div className="card-resumen border-l-4 border-red-500 bg-gray-800 p-5 rounded-lg shadow">
          <p className="text-xs text-gray-400 uppercase font-bold mb-3">Egresos / Compras</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Insumos</span>
              <span className="text-red-400 font-bold">-${resumen.insumos.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Equipos</span>
              <span className="text-red-400 font-bold">-${resumen.equipos.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Total Turno (Acumulado Ventas) */}
        <div className="card-resumen border-l-4 border-yellow-500 bg-gray-800 p-5 rounded-lg shadow">
          <p className="text-xs text-yellow-500 uppercase font-bold mb-1">Total Ventas (Venta)</p>
          <p className="text-3xl font-black text-white mt-2">
            ${resumen.productos.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-500 mt-2 uppercase">Ventas brutas sin descontar gastos</p>
        </div>
      

      {/* Tarjeta Balance de Efectivo Físico */}
      <div className="bg-yellow-500 p-8 rounded-xl shadow-2xl text-center mb-8">
        <p className="text-yellow-900 font-bold uppercase tracking-widest text-sm">Efectivo Físico en Caja</p>
        <p className="text-5xl font-black text-yellow-950 mt-2">
          ${resumen.totalAcumulado.toLocaleString()}
        </p>
        <p className="text-yellow-800 text-xs mt-3 font-medium">Monto calculado: (Base + Ventas Efectivo) - Gastos</p>
      </div>
</div>
      {/* Botón de cierre */}
      <button 
        onClick={ejecutarCierre} 
        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-xl text-xl shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.98]"
      >
        FINALIZAR JORNADA Y CERRAR TURNO
      </button>
    </div>
  );
};

export default CierreCaja;