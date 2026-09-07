import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEmployees, createOwnerEmployee, updateOwnerEmployee, deleteOwnerEmployee } from '../../api';
import ConfirmModal from '../../components/ui/ConfirmModal';

const Empleados = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '' });
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, employeeId: null });
  const [searchQuery, setSearchQuery] = useState('');

  const { data: employees, isLoading } = useQuery({ queryKey: ['employees'], queryFn: fetchEmployees });

  const createMutation = useMutation({
    mutationFn: createOwnerEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateOwnerEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      closeModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOwnerEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });

  const openModal = (emp = null) => {
    if (emp) {
      setEditingId(emp.id);
      setForm({ name: emp.name, email: emp.email || '', phoneNumber: emp.phoneNumber || '' });
    } else {
      setEditingId(null);
      setForm({ name: '', email: '', phoneNumber: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({ name: '', email: '', phoneNumber: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filteredEmployees = employees?.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (emp.email && emp.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="empleados-page">
      <header className="page-header">
        <div>
          <h1>Empleados</h1>
          <p className="text-muted">Gestiona a los profesionales de tu negocio.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Buscar empleado..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '250px' }}
          />
          <button className="btn btn-primary" onClick={() => openModal()}>+ Nuevo Empleado</button>
        </div>
      </header>

      {isLoading ? (
        <p>Cargando empleados...</p>
      ) : (
        <div className="employees-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {filteredEmployees?.length === 0 && (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>
              <p className="text-muted">No se encontraron empleados.</p>
            </div>
          )}
          {filteredEmployees?.map(emp => (
            <div key={emp.id} className="employee-card glass-panel" style={{ textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <div className="avatar" style={{ margin: '0 auto 1rem auto', width: '80px', height: '80px', fontSize: '2rem' }}>
                {emp.name.charAt(0)}
              </div>
              <h3 style={{ margin: 0 }}>{emp.name}</h3>
              <p className="text-muted" style={{ margin: '0.5rem 0' }}>{emp.role === 1 ? 'Dueño' : 'Profesional'}</p>
              
              <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button className="btn btn-outline" style={{ padding: '0.5rem', flex: 1 }} onClick={() => openModal(emp)}>Editar</button>
                {emp.role !== 1 && (
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '0.5rem', flex: 1, borderColor: 'var(--danger)', color: 'var(--danger)' }} 
                    onClick={() => setConfirmConfig({ isOpen: true, employeeId: emp.id })}
                    disabled={deleteMutation.isPending}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '400px', padding: '2rem', background: 'white' }}>
            <h2>{editingId ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input 
                className="input-field" placeholder="Nombre completo" required
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} 
              />
              <input 
                className="input-field" placeholder="Correo electrónico (opcional)" type="email"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} 
              />
              <input 
                className="input-field" placeholder="Teléfono (opcional)"
                value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} 
              />
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
        title="Eliminar Empleado"
        message="¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer."
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={() => {
          deleteMutation.mutate(confirmConfig.employeeId);
          setConfirmConfig({ isOpen: false, employeeId: null });
        }}
        onCancel={() => setConfirmConfig({ isOpen: false, employeeId: null })}
      />
    </div>
  );
};

export default Empleados;
