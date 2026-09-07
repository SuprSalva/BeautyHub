import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Scissors, DollarSign, Edit2, Trash2 } from 'lucide-react';
import { fetchOwnerServices, createOwnerService, updateOwnerService, deleteOwnerService } from '../../api';
import ConfirmModal from '../../components/ui/ConfirmModal';


const Services = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '', durationMinutes: 30 });
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, serviceId: null });
  const [searchQuery, setSearchQuery] = useState('');

  const { data: services, isLoading } = useQuery({ queryKey: ['owner-services'], queryFn: fetchOwnerServices });

  const createMutation = useMutation({
    mutationFn: createOwnerService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-services'] });
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateOwnerService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-services'] });
      closeModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOwnerService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-services'] });
    }
  });

  const openModal = (service = null) => {
    if (service) {
      setEditingId(service.id);
      setServiceForm({
        name: service.name,
        description: service.description,
        price: service.price,
        durationMinutes: service.durationMinutes
      });
    } else {
      setEditingId(null);
      setServiceForm({ name: '', description: '', price: '', durationMinutes: 30 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setServiceForm({ name: '', description: '', price: '', durationMinutes: 30 });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name: serviceForm.name,
      description: serviceForm.description,
      price: parseFloat(serviceForm.price),
      durationMinutes: parseInt(serviceForm.durationMinutes)
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredServices = services?.filter(srv => 
    srv.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    srv.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Servicios</h1>
          <p className="text-gray-500">Gestiona el catálogo de servicios de tu salón.</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="text" 
            className="w-[250px] px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" 
            placeholder="Buscar servicio..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none bg-blue-500 text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]" onClick={() => openModal()}>+ Nuevo Servicio</button>
        </div>
      </header>

      {isLoading ? (
        <p>Cargando servicios...</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredServices?.length === 0 && (
            <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-8 text-center">
              <p className="text-gray-500">No se encontraron servicios.</p>
            </div>
          )}
          {filteredServices?.map(srv => (
            <div key={srv.id} className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-6 flex justify-between items-center">
              <div>
                <h3 className="m-0 text-blue-500 text-lg font-semibold">{srv.name}</h3>
                <p className="m-0 text-gray-500">{srv.description}</p>
                <small className="text-gray-500 inline-flex items-center gap-1 mt-1">
                  <Clock size={12} /> {srv.durationMinutes} min
                </small>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-2xl font-bold text-emerald-500">${srv.price}</span>
                <div className="flex gap-2">
                  <button className="inline-flex items-center justify-center px-3 py-2 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-2 bg-transparent text-blue-500 border-blue-500 hover:bg-blue-100" onClick={() => openModal(srv)}>
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="inline-flex items-center justify-center px-3 py-2 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-2 bg-transparent text-blue-500 border-blue-500 hover:bg-blue-50" 
                    onClick={() => setConfirmConfig({ isOpen: true, serviceId: srv.id })}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para agregar/editar servicio */}
      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-[1000]">
          <div className="bg-white border border-white/50 rounded-2xl shadow-lg w-full max-w-[400px] mx-4 p-8">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
              <input 
                className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Nombre (ej. Corte de Cabello)" required
                value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} 
              />
              <input 
                className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Descripción corta" required
                value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} 
              />
              <div className="flex gap-4">
                <input 
                  className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Precio ($)" type="number" required
                  value={serviceForm.price} onChange={e => setServiceForm({...serviceForm, price: e.target.value})} 
                />
                <input 
                  className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Minutos" type="number" required
                  value={serviceForm.durationMinutes} onChange={e => setServiceForm({...serviceForm, durationMinutes: e.target.value})} 
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
        title="Eliminar Servicio"
        message="¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer."
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={() => {
          deleteMutation.mutate(confirmConfig.serviceId);
          setConfirmConfig({ isOpen: false, serviceId: null });
        }}
        onCancel={() => setConfirmConfig({ isOpen: false, serviceId: null })}
      />
    </div>
  );
};

export default Services;
