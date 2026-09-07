import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
        sellMutation.mutate({ itemId: product.id, itemType: 'Product', quantity: 1, paymentMethod: 'Cash' });
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
        sellMutation.mutate({ itemId: service.id, itemType: 'Service', quantity: 1, paymentMethod: 'Cash' });
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
    <div className="pos-page">
      <header className="page-header">
        <div>
          <h1>Caja y Punto de Venta</h1>
          <p className="text-muted">Cobra productos y servicios al instante.</p>
        </div>
        <button className="btn btn-outline" onClick={() => setIsManualModalOpen(true)}>+ Movimiento Manual</button>
      </header>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Panel Izquierdo: Venta de Productos/Servicios */}
        <div style={{ flex: 2 }}>
          <div style={{ display: 'flex', border: '1px solid var(--surface-300)', borderRadius: 'var(--radius-md)', overflow: 'hidden', width: 'fit-content' }}>
            <button 
              className={`btn ${activeTab === 'products' ? 'btn-primary' : ''}`}
              style={{ borderRadius: 0, padding: '0.5rem 1rem', background: activeTab === 'products' ? 'var(--brand-primary)' : 'transparent', color: activeTab === 'products' ? 'white' : 'var(--text-main)', border: 'none' }}
              onClick={() => setActiveTab('products')}
            >Productos Físicos</button>
            <button 
              className={`btn ${activeTab === 'services' ? 'btn-primary' : ''}`}
              style={{ borderRadius: 0, padding: '0.5rem 1rem', background: activeTab === 'services' ? 'var(--brand-primary)' : 'transparent', color: activeTab === 'services' ? 'white' : 'var(--text-main)', border: 'none' }}
              onClick={() => setActiveTab('services')}
            >Servicios (Visita Rápida)</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            {activeTab === 'products' && (
              <>
                {products?.map(prod => (
                  <div key={prod.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ color: 'var(--brand-primary)', margin: 0 }}>{prod.name}</h4>
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>Stock: {prod.stock}</p>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>${prod.price}</span>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.5rem 1rem' }}
                        onClick={() => handleSellProduct(prod)}
                        disabled={prod.stock < 1 || sellMutation.isPending}
                      >
                        Cobrar
                      </button>
                    </div>
                  </div>
                ))}
                {products?.length === 0 && <p className="text-muted">No tienes productos en el inventario.</p>}
              </>
            )}

            {activeTab === 'services' && (
              <>
                {services?.map(srv => (
                  <div key={srv.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ color: 'var(--brand-secondary)', margin: 0 }}>{srv.name}</h4>
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>Duración: {srv.durationMinutes} min</p>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>${srv.price}</span>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.5rem 1rem', background: 'var(--brand-secondary)' }}
                        onClick={() => handleSellService(srv)}
                        disabled={sellMutation.isPending}
                      >
                        Cobrar
                      </button>
                    </div>
                  </div>
                ))}
                {services?.length === 0 && <p className="text-muted">No tienes servicios registrados.</p>}
              </>
            )}
          </div>
        </div>

        {/* Panel Derecho: Movimientos del día */}
        <div style={{ flex: 1 }}>
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Corte de Caja</h3>
              <select 
                value={transactionMode} 
                onChange={(e) => setTransactionMode(e.target.value)}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: 'var(--radius-full)', 
                  border: '1px solid var(--brand-primary-light)', 
                  outline: 'none',
                  backgroundColor: 'var(--brand-primary-light)',
                  color: 'var(--brand-primary)',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  paddingRight: '2rem',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238B5CF6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1em'
                }}
              >
                <option value="today">Hoy</option>
                <option value="week">Últimos 7 días</option>
                <option value="month">Últimos 30 días</option>
                <option value="all">Historial Completo</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowUpCircle size={16} color="var(--success)" /> Ingresos:</span>
              <strong style={{ color: 'var(--success)' }}>${totalIncomes}</strong>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowDownCircle size={16} color="var(--danger)" /> Egresos:</span>
              <strong style={{ color: 'var(--danger)' }}>${totalExpenses}</strong>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
              <span style={{ fontWeight: 700 }}>Balance Total:</span>
              <strong style={{ fontSize: '1.25rem', color: balance >= 0 ? 'var(--brand-primary)' : 'var(--danger)' }}>${balance}</strong>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3>Transacciones Recientes</h3>
            {isLoading ? (
              <p>Cargando...</p>
            ) : transactions?.length === 0 ? (
              <p className="text-muted" style={{ marginTop: '1rem' }}>Aún no hay movimientos en este periodo.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                {transactions?.map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--surface-200)' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem' }}>{t.description}</strong>
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>{formatTime(t.date)}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ color: t.type === 'Income' ? 'var(--success)' : 'var(--danger)' }}>
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
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '400px', padding: '2rem', background: 'white' }}>
            <h2>Registrar Movimiento</h2>
            <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <select 
                className="input-field" required
                value={manualForm.type} onChange={e => setManualForm({...manualForm, type: e.target.value})}
              >
                <option value="Income">Ingreso a Caja</option>
                <option value="Expense">Egreso (Salida de dinero)</option>
              </select>
              
              <input 
                className="input-field" placeholder="Monto ($)" type="number" step="0.01" required
                value={manualForm.amount} onChange={e => setManualForm({...manualForm, amount: e.target.value})} 
              />
              
              <input 
                className="input-field" placeholder="Concepto (ej. Pago de Agua)" required
                value={manualForm.description} onChange={e => setManualForm({...manualForm, description: e.target.value})} 
              />
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={closeManualModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={manualMutation.isPending}>
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
