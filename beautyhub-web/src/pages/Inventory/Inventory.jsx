import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus } from 'lucide-react';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../api';
import ConfirmModal from '../../components/ui/ConfirmModal';

const Inventory = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '' });
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, productId: null });
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products, isLoading } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const openModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock
      });
    } else {
      setEditingId(null);
      setProductForm({ name: '', description: '', price: '', stock: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setProductForm({ name: '', description: '', price: '', stock: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock)
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredProducts = products?.filter(prod => 
    prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    prod.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="inventory-page">
      <header className="page-header">
        <div>
          <h1>Inventario</h1>
          <p className="text-muted">Gestiona los productos físicos de tu salón.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Buscar producto..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '250px' }}
          />
          <button className="btn btn-primary" onClick={() => openModal()}>+ Nuevo Producto</button>
        </div>
      </header>

      {isLoading ? (
        <p>Cargando inventario...</p>
      ) : (
        <div className="services-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredProducts?.length === 0 && (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <Package size={48} color="var(--brand-primary)" style={{ marginBottom: '1rem' }} />
              <h3>Inventario Vacío</h3>
              <p className="text-muted">No se encontraron productos.</p>
            </div>
          )}
          {filteredProducts?.map(prod => (
            <div key={prod.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--brand-primary)' }}>{prod.name}</h3>
                <p className="text-muted" style={{ margin: 0 }}>{prod.description}</p>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span className="badge" style={{ backgroundColor: prod.stock <= 5 ? 'var(--warning)' : 'var(--brand-primary-light)', color: prod.stock <= 5 ? 'white' : 'var(--brand-primary-hover)' }}>
                    Stock: {prod.stock}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--success)' }}>${prod.price}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} onClick={() => openModal(prod)}>Editar</button>
                <button 
                  className="btn btn-outline" 
                  style={{ padding: '0.5rem 1rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} 
                  onClick={() => setConfirmConfig({ isOpen: true, productId: prod.id })}
                  disabled={deleteMutation.isPending}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para agregar/editar producto */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '400px', padding: '2rem', background: 'white' }}>
            <h2>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input 
                className="input-field" placeholder="Nombre (ej. Shampoo Keratina)" required
                value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} 
              />
              <input 
                className="input-field" placeholder="Descripción corta" required
                value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} 
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input 
                  className="input-field" placeholder="Precio ($)" type="number" step="0.01" required
                  value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} 
                />
                <input 
                  className="input-field" placeholder="Stock Inicial" type="number" required
                  value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title="Eliminar Producto"
        message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={() => {
          deleteMutation.mutate(confirmConfig.productId);
          setConfirmConfig({ isOpen: false, productId: null });
        }}
        onCancel={() => setConfirmConfig({ isOpen: false, productId: null })}
      />
    </div>
  );
};

export default Inventory;
