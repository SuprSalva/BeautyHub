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
    <div className="">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1>Empleados</h1>
          <p className="text-slate-500">Gestiona a los profesionales de tu negocio.</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="text" 
            className="w-[250px] px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" 
            placeholder="Buscar empleado..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none bg-blue-500 text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]" onClick={() => openModal()}>+ Nuevo Empleado</button>
        </div>
      </header>

      {isLoading ? (
        <p>Cargando empleados...</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 mt-4">
          {filteredEmployees?.length === 0 && (
            <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-8 text-center col-span-full">
              <p className="text-slate-500">No se encontraron empleados.</p>
            </div>
          )}
          {filteredEmployees?.map(emp => (
            <div key={emp.id} className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-8 text-center flex flex-col cursor-pointer">
              <div className="rounded-full bg-blue-500 text-white flex items-center justify-center mx-auto mb-4 w-[80px] h-[80px] text-3xl">
                {emp.name.charAt(0)}
              </div>
              <h3 className="m-0">{emp.name}</h3>
              <p className="text-slate-500 my-2">{emp.role === 1 ? 'Dueño' : 'Profesional'}</p>
              
              <div className="mt-auto pt-4 flex gap-2 justify-center">
                <button className="inline-flex items-center justify-center rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer bg-transparent text-blue-500 border-2 border-blue-500 hover:bg-blue-100 p-2 flex-1" onClick={() => openModal(emp)}>Editar</button>
                {emp.role !== 1 && (
                  <button 
                    className="inline-flex items-center justify-center rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer bg-transparent border-2 hover:bg-blue-50 p-2 flex-1 border-blue-500 text-blue-500" 
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <div className="bg-white backdrop-blur-md border border-white/50 rounded-2xl shadow-lg w-full max-w-[400px] mx-4 p-8">
            <h2>{editingId ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
              <input 
                className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Nombre completo" required
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} 
              />
              <input 
                className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Correo electrónico (opcional)" type="email"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} 
              />
              <input 
                className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Teléfono (opcional)"
                value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} 
              />
              <div className="flex gap-4 mt-4">
                <button type="button" className="inline-flex items-center justify-center rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer bg-transparent text-blue-500 border-2 border-blue-500 hover:bg-blue-100 flex-1 px-6 py-3" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="inline-flex items-center justify-center rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none bg-blue-500 text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] flex-1 px-6 py-3" disabled={createMutation.isPending || updateMutation.isPending}>
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
