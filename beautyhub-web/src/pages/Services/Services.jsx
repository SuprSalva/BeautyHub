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
    <div className="services-page">
      <header className="page-header">
        <div>
          <h1>Servicios</h1>
          <p className="text-muted">Gestiona el catálogo de servicios de tu salón.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Buscar servicio..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '250px' }}
          />
          <button className="btn btn-primary" onClick={() => openModal()}>+ Nuevo Servicio</button>
        </div>
      </header>

      {isLoading ? (
        <p>Cargando servicios...</p>
      ) : (
        <div className="services-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredServices?.length === 0 && (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <p className="text-muted">No se encontraron servicios.</p>
            </div>
          )}
          {filteredServices?.map(srv => (
            <div key={srv.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--brand-primary)' }}>{srv.name}</h3>
                <p className="text-muted" style={{ margin: 0 }}>{srv.description}</p>
                <small className="text-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} /> {srv.durationMinutes} min
                </small>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>${srv.price}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }} onClick={() => openModal(srv)}>
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '0.5rem', borderColor: 'var(--danger)', color: 'var(--danger)', display: 'flex', alignItems: 'center' }} 
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
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '400px', padding: '2rem', background: 'white' }}>
            <h2>{editingId ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input 
                className="input-field" placeholder="Nombre (ej. Corte de Cabello)" required
                value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} 
              />
              <input 
                className="input-field" placeholder="Descripción corta" required
                value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} 
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input 
                  className="input-field" placeholder="Precio ($)" type="number" required
                  value={serviceForm.price} onChange={e => setServiceForm({...serviceForm, price: e.target.value})} 
                />
                <input 
                  className="input-field" placeholder="Minutos" type="number" required
                  value={serviceForm.durationMinutes} onChange={e => setServiceForm({...serviceForm, durationMinutes: e.target.value})} 
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
