import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { fetchProducts, fetchOwnerServices, fetchTransactions, createTransaction, sellItem } from '../../api';
import ConfirmModal from '../../components/ui/ConfirmModal';

const POS = () => {
  const queryClient = useQueryClient();
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({ type: 'Income', amount: '', description: '' });
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'services'
  const [transactionMode, setTransactionMode] = useState('today');
  
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });

  const { data: products } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });
  const { data: services } = useQuery({ queryKey: ['owner-services'], queryFn: fetchOwnerServices });
  const { data: transactions, isLoading } = useQuery({ queryKey: ['transactions', transactionMode], queryFn: () => fetchTransactions(transactionMode) });

  const manualMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      closeManualModal();
      toast.success('Movimiento registrado exitosamente');
    }
  });

  const sellMutation = useMutation({
    mutationFn: sellItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const handleManualSubmit = (e) => {
    e.preventDefault();
    manualMutation.mutate({
      type: manualForm.type,
      amount: parseFloat(manualForm.amount),
      description: manualForm.description,
      paymentMethod: 'Cash'
    });
  };

  const closeManualModal = () => {
    setIsManualModalOpen(false);
    setManualForm({ type: 'Income', amount: '', description: '' });
  };

  const handleSellProduct = (product) => {
    if (product.stock < 1) {
      alert("No hay stock suficiente de este producto.");
      return;
    }
    setConfirmConfig({
      isOpen: true,
      title: 'Cobrar Producto',
      message: `¿Cobrar 1x ${product.name} por $${product.price}?`,
      onConfirm: () => {
        sellMutation.mutate({ itemId: product.id, itemType: 'Product', quantity: 1, paymentMethod: 'Cash' }, { onSuccess: () => toast.success('Cobro exitoso') });
        setConfirmConfig({ ...confirmConfig, isOpen: false });
      },
      isDanger: false
    });
  };

  const handleSellService = (service) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Cobrar Servicio',
      message: `¿Cobrar servicio ${service.name} por $${service.price}? (Visita sin cita previa)`,
      onConfirm: () => {
        sellMutation.mutate({ itemId: service.id, itemType: 'Service', quantity: 1, paymentMethod: 'Cash' }, { onSuccess: () => toast.success('Cobro exitoso') });
        setConfirmConfig({ ...confirmConfig, isOpen: false });
      },
      isDanger: false
    });
  };

  // Calcular totales
  const totalIncomes = transactions?.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0) || 0;
  const totalExpenses = transactions?.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0) || 0;
  const balance = totalIncomes - totalExpenses;

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    if (transactionMode === 'today') {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Caja y Punto de Venta</h1>
          <p className="text-gray-500">Cobra productos y servicios al instante.</p>
        </div>
        <button className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-2 bg-transparent text-blue-500 border-blue-500 hover:bg-blue-100" onClick={() => setIsManualModalOpen(true)}>+ Movimiento Manual</button>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Panel Izquierdo: Venta de Productos/Servicios */}
        <div className="flex-[2]">
          <div className="relative grid grid-cols-2 p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl w-full max-w-[400px] border border-slate-200 shadow-inner shrink-0">
            <div 
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-200/60 transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)"
              style={{ transform: activeTab === 'products' ? 'translateX(4px)' : 'translateX(calc(100% + 4px))' }}
            />
            <button 
              className={`relative z-10 flex items-center justify-center px-4 py-2.5 font-semibold text-[0.95rem] transition-colors duration-300 rounded-lg outline-none ${activeTab === 'products' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('products')}
            >Productos Físicos</button>
            <button 
              className={`relative z-10 flex items-center justify-center px-4 py-2.5 font-semibold text-[0.95rem] transition-colors duration-300 rounded-lg outline-none ${activeTab === 'services' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('services')}
            >Servicios (Visita Rápida)</button>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mt-6">
            {activeTab === 'products' && (
              <>
                {products?.map(prod => (
                  <div key={prod.id} className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-6 flex flex-col justify-between">
                    <div>
                      <h4 className="text-blue-500 m-0 font-semibold">{prod.name}</h4>
                      <p className="text-gray-500 text-sm mt-1">Stock: {prod.stock}</p>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="font-bold text-xl">${prod.price}</span>
                      <button 
                        className="inline-flex items-center justify-center px-4 py-2 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none bg-blue-500 text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed" 
                        onClick={() => handleSellProduct(prod)}
                        disabled={prod.stock < 1 || sellMutation.isPending}
                      >
                        Cobrar
                      </button>
                    </div>
                  </div>
                ))}
                {products?.length === 0 && <p className="text-gray-500">No tienes productos en el inventario.</p>}
              </>
            )}

            {activeTab === 'services' && (
              <>
                {services?.map(srv => (
                  <div key={srv.id} className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-6 flex flex-col justify-between">
                    <div>
                      <h4 className="text-blue-600 m-0 font-semibold">{srv.name}</h4>
                      <p className="text-gray-500 text-sm mt-1">Duración: {srv.durationMinutes} min</p>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="font-bold text-xl">${srv.price}</span>
                      <button 
                        className="inline-flex items-center justify-center px-4 py-2 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none bg-blue-600 text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)] hover:bg-blue-700 hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed" 
                        onClick={() => handleSellService(srv)}
                        disabled={sellMutation.isPending}
                      >
                        Cobrar
                      </button>
                    </div>
                  </div>
                ))}
                {services?.length === 0 && <p className="text-gray-500">No tienes servicios registrados.</p>}
              </>
            )}
          </div>
        </div>

        {/* Panel Derecho: Movimientos del día */}
        <div className="flex-1">
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
              <h3 className="m-0 font-semibold text-lg">Corte de Caja</h3>
              <select 
                value={transactionMode} 
                onChange={(e) => setTransactionMode(e.target.value)}
                className="px-4 py-2 rounded-full border border-blue-200 outline-none bg-blue-50 text-blue-600 font-semibold cursor-pointer appearance-none pr-8 bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%233B82F6\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[position:right_0.75rem_center] bg-[size:1em]"
              >
                <option value="today">Hoy</option>
                <option value="week">Últimos 7 días</option>
                <option value="month">Últimos 30 días</option>
                <option value="all">Historial Completo</option>
              </select>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="text-gray-500 flex items-center gap-2"><ArrowUpCircle size={16} className="text-emerald-500" /> Ingresos:</span>
              <strong className="text-emerald-500">${totalIncomes}</strong>
            </div>
            
            <div className="flex justify-between mb-4">
              <span className="text-gray-500 flex items-center gap-2"><ArrowDownCircle size={16} className="text-blue-500" /> Egresos:</span>
              <strong className="text-blue-500">${totalExpenses}</strong>
            </div>
            
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <span className="font-bold">Balance Total:</span>
              <strong className={`text-xl ${balance >= 0 ? 'text-blue-500' : 'text-blue-500'}`}>${balance}</strong>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-6">
            <h3 className="font-semibold text-lg mb-4">Transacciones Recientes</h3>
            {isLoading ? (
              <p>Cargando...</p>
            ) : transactions?.length === 0 ? (
              <p className="text-gray-500 mt-4">Aún no hay movimientos en este periodo.</p>
            ) : (
              <div className="flex flex-col gap-4 mt-4 max-h-[400px] overflow-y-auto">
                {transactions?.map(t => (
                  <div key={t.id} className="flex justify-between pb-2 border-b border-gray-100">
                    <div>
                      <strong className="block text-sm">{t.description}</strong>
                      <span className="text-gray-500 text-xs">{formatTime(t.date)}</span>
                    </div>
                    <div className="text-right">
                      <strong className={t.type === 'Income' ? 'text-emerald-500' : 'text-blue-500'}>
                        {t.type === 'Income' ? '+' : '-'}${t.amount}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Manual */}
      {isManualModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-slate-900/40 backdrop-blur-sm animate-fade-in flex items-center justify-center z-[1000]">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] w-full max-w-[400px] mx-4 animate-fade-in-up p-8">
            <h2 className="text-xl font-bold mb-4">Registrar Movimiento</h2>
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-4 mt-4">
              <Select
                value={manualForm.type}
                onChange={val => setManualForm({...manualForm, type: val})}
                options={[
                  { value: 'Income', label: 'Ingreso a Caja' },
                  { value: 'Expense', label: 'Egreso (Salida de dinero)' }
                ]}
              />
              
              <input 
                className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Monto ($)" type="number" step="0.01" required
                value={manualForm.amount} onChange={e => setManualForm({...manualForm, amount: e.target.value})} 
              />
              
              <input 
                className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Concepto (ej. Pago de Agua)" required
                value={manualForm.description} onChange={e => setManualForm({...manualForm, description: e.target.value})} 
              />
              
              <div className="flex gap-4 mt-4">
                <button type="button" className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-2 bg-transparent text-blue-500 border-blue-500 hover:bg-blue-100" onClick={closeManualModal}>Cancelar</button>
                <button type="submit" className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none bg-blue-500 text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]" disabled={manualMutation.isPending}>
                  {manualMutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        isDanger={confirmConfig.isDanger}
        confirmText="Cobrar"
      />
    </div>
  );
};

export default POS;
