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
    <div className="w-full">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Inventario</h1>
          <p className="text-gray-500">Gestiona los productos físicos de tu salón.</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="text" 
            className="w-[250px] px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" 
            placeholder="Buscar producto..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none bg-blue-500 text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]" onClick={() => openModal()}>+ Nuevo Producto</button>
        </div>
      </header>

      {isLoading ? (
        <p>Cargando inventario...</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredProducts?.length === 0 && (
            <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-12 text-center">
              <Package size={48} className="text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Inventario Vacío</h3>
              <p className="text-gray-500">No se encontraron productos.</p>
            </div>
          )}
          {filteredProducts?.map(prod => (
            <div key={prod.id} className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-6 flex justify-between items-center">
              <div>
                <h3 className="m-0 text-blue-500 text-lg font-semibold">{prod.name}</h3>
                <p className="m-0 text-gray-500">{prod.description}</p>
                <div className="mt-2 flex gap-4 items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${prod.stock <= 5 ? 'bg-amber-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                    Stock: {prod.stock}
                  </span>
                  <span className="font-semibold text-emerald-500">${prod.price}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="inline-flex items-center justify-center px-4 py-2 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-2 bg-transparent text-blue-500 border-blue-500 hover:bg-blue-100" onClick={() => openModal(prod)}>Editar</button>
                <button 
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-2 bg-transparent text-blue-500 border-blue-500 hover:bg-blue-50" 
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
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-[1000]">
          <div className="bg-white border border-white/50 rounded-2xl shadow-lg w-full max-w-[400px] mx-4 p-8">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
              <input 
                className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Nombre (ej. Shampoo Keratina)" required
                value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} 
              />
              <input 
                className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Descripción corta" required
                value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} 
              />
              <div className="flex gap-4">
                <input 
                  className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Precio ($)" type="number" step="0.01" required
                  value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} 
                />
                <input 
                  className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Stock Inicial" type="number" required
                  value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} 
                />
              </div>
              <div className="flex gap-4 mt-4">
                <button type="button" className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-2 bg-transparent text-blue-500 border-blue-500 hover:bg-blue-100" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none bg-blue-500 text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]" disabled={createMutation.isPending || updateMutation.isPending}>
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
