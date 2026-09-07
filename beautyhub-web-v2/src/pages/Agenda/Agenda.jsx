import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CalendarX2, User, Scissors, CheckCircle, XCircle } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale';

registerLocale('es', es);
import { fetchAgenda, fetchServices, fetchEmployees, createAppointment, updateAppointmentStatus } from '../../api';
import Select from '../../components/ui/Select';
import TimePicker from '../../components/ui/TimePicker';

const mockTimes = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

const getLocalDateStr = (d = new Date()) => {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

const Agenda = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('day'); // 'day' | 'upcoming'
  const [selectedDate, setSelectedDate] = useState(getLocalDateStr());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [penaltyFee, setPenaltyFee] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [checkoutServiceIds, setCheckoutServiceIds] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    clientName: '',
    serviceIds: [],
    employeeId: '',
    time: '',
    date: ''
  });

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['agenda', viewMode, selectedDate],
    queryFn: () => fetchAgenda(viewMode === 'day' ? selectedDate : null, viewMode)
  });

  const { data: services } = useQuery({ queryKey: ['services'], queryFn: fetchServices });
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: fetchEmployees });

  const mutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
      setIsModalOpen(false);
      setBookingForm({ clientName: '', serviceIds: [], employeeId: '', time: '', date: '' });
      toast.success('Cita agendada correctamente');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, finalServiceIds, penaltyFee }) => updateAppointmentStatus(id, status, finalServiceIds, penaltyFee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
      setActionModalOpen(false);
      setIsCancelling(false);
      setPenaltyFee('');
      setSelectedApp(null);
      setCheckoutServiceIds([]);
      toast.success('Estado actualizado exitosamente');
    }
  });

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    
    // Parse time
    const [timeStr, period] = bookingForm.time.split(' ');
    let [hours, minutes] = timeStr.split(':');
    if (period === 'PM' && hours !== '12') hours = parseInt(hours) + 12;
    if (period === 'AM' && hours === '12') hours = '00';
    
    const targetDate = bookingForm.date || selectedDate;
    const startTime = new Date(`${targetDate}T${hours}:${minutes}:00`).toISOString();

    mutation.mutate({
      serviceIds: bookingForm.serviceIds,
      employeeId: bookingForm.employeeId,
      startTime: startTime,
      clientName: bookingForm.clientName,
      clientEmail: "manual@cliente.com",
      clientPhone: "000-0000"
    });
  };

  const calculateCheckoutTotal = () => {
    if (!services) return 0;
    return services
      .filter(s => checkoutServiceIds.includes(s.id))
      .reduce((total, s) => total + s.price, 0);
  };

  const totalAppointments = appointments?.length || 0;
  
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString([], { day: '2-digit', month: 'short' });
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <header className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold m-0 text-slate-900">Agenda</h1>
          <p className="text-slate-500 mt-2">Gestiona las citas programadas.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto mt-2 md:mt-0">
          <div className="relative grid grid-cols-2 p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl w-[220px] border border-slate-200 shadow-inner shrink-0">
            <div 
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-200/60 transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)"
              style={{ transform: viewMode === 'day' ? 'translateX(4px)' : 'translateX(calc(100% + 4px))' }}
            />
            <button 
              className={`relative z-10 flex items-center justify-center px-4 py-2 font-semibold text-[0.95rem] transition-colors duration-300 rounded-lg outline-none ${viewMode === 'day' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setViewMode('day')}
            >Día</button>
            <button 
              className={`relative z-10 flex items-center justify-center px-4 py-2 font-semibold text-[0.95rem] transition-colors duration-300 rounded-lg outline-none ${viewMode === 'upcoming' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setViewMode('upcoming')}
            >Próximas</button>
          </div>
          {viewMode === 'day' && (
            <div className="w-[150px]">
              <DatePicker portalId="root" 
                locale="es"
                selected={selectedDate ? new Date(selectedDate + 'T12:00:00') : null}
                onChange={(date) => setSelectedDate(getLocalDateStr(date))}
                className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                dateFormat="dd/MM/yyyy"
              />
            </div>
          )}
          <button className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none bg-blue-500 text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]" onClick={() => {
            setBookingForm({ ...bookingForm, date: selectedDate });
            setIsModalOpen(true);
          }}>+ Nueva Cita</button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-[3]">
          {isLoading ? (
            <p>Cargando citas...</p>
          ) : appointments?.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-12 text-center">
              <div className="mb-4 text-blue-500 flex justify-center">
                <CalendarX2 size={48} />
              </div>
              <h3 className="text-xl font-bold">Día Libre</h3>
              <p className="text-slate-500">No hay citas programadas para este día.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {appointments?.map(app => (
                <div 
                  key={app.id} 
                  className={`bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg flex p-0 overflow-hidden ${app.status === 'Scheduled' ? 'cursor-pointer' : 'cursor-default'} ${app.status === 'Cancelled' ? 'opacity-60' : 'opacity-100'}`}
                  onClick={() => {
                    if (app.status === 'Scheduled') {
                      setSelectedApp(app);
                      setCheckoutServiceIds(app.serviceIds || []);
                      setActionModalOpen(true);
                    }
                  }}
                >
                  <div className="bg-blue-100 text-blue-500 p-6 flex flex-col justify-center items-center min-w-[120px] font-bold">
                    {viewMode === 'upcoming' && (
                      <div className="text-[0.85rem] text-blue-500/80">
                        {formatDate(app.startTime)}
                      </div>
                    )}
                    <div>{formatTime(app.startTime)}</div>
                  </div>
                  
                  <div className="p-6 flex-1 flex justify-between items-center">
                    <div>
                      <h3 className={`m-0 mb-1 text-lg font-bold ${app.status === 'Cancelled' ? 'line-through' : 'none'}`}>{app.serviceName}</h3>
                      <p className="text-slate-500 m-0 flex items-center gap-1">
                        <User size={14} /> Cliente: {app.clientName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="bg-slate-200 text-slate-900 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold">
                        <Scissors size={14} /> {app.employeeName}
                      </span>
                      <p className={`mt-2 text-[0.85rem] font-semibold ${app.status === 'Completed' ? 'text-green-500' : app.status === 'Cancelled' ? 'text-blue-500' : 'text-yellow-500'}`}>
                        {app.status === 'Scheduled' ? 'Pendiente' : app.status === 'Completed' ? 'Completada' : 'Cancelada'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg p-6">
            <h3 className="border-b border-slate-200 pb-2 mb-4 text-lg font-bold">
              Resumen del Día
            </h3>
            <div className="flex justify-between mb-2">
              <span className="text-slate-500">Total Citas:</span>
              <strong>{totalAppointments}</strong>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-slate-500">Confirmadas:</span>
              <strong className="text-green-500">{totalAppointments}</strong>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-slate-900/40 backdrop-blur-sm animate-fade-in flex items-center justify-center z-[1000]">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] w-full max-w-[450px] mx-4 max-h-[90vh] animate-fade-in-up flex flex-col overflow-hidden">
            <div className="p-8 pb-4 shrink-0 border-b border-slate-100">
              <h2 className="text-2xl font-bold mb-2">Agendar Cita Manual</h2>
              <p className="text-slate-500 m-0">Selecciona la fecha y hora de la cita.</p>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 py-4 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-4">
                <div className="w-full">
                  <DatePicker portalId="root" 
                    locale="es"
                    selected={bookingForm.date ? new Date(bookingForm.date + 'T12:00:00') : null}
                    onChange={(date) => setBookingForm({...bookingForm, date: getLocalDateStr(date)})}
                    className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Fecha de la Cita"
                    required
                  />
                </div>
                <input 
                  className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Nombre del Cliente" required
                  value={bookingForm.clientName} onChange={e => setBookingForm({...bookingForm, clientName: e.target.value})} 
                />
                
                <Select
                  isMulti={true}
                  value={bookingForm.serviceIds}
                  onChange={val => setBookingForm({...bookingForm, serviceIds: val})}
                  placeholder="Servicios (Selecciona 1 o más)"
                  options={services?.map(s => ({ value: s.id, label: `${s.name} ($${s.price})` })) || []}
                />

                <Select
                  value={bookingForm.employeeId}
                  onChange={val => setBookingForm({...bookingForm, employeeId: val})}
                  placeholder="Selecciona un Profesional"
                  options={employees?.map(e => ({ value: e.id, label: e.name })) || []}
                />

                <TimePicker
                  value={bookingForm.time || '09:00 AM'}
                  onChange={val => setBookingForm({...bookingForm, time: val})}
                />
              </div>

              <div className="p-8 pt-4 shrink-0 border-t border-slate-100 bg-slate-50/50 flex gap-4 mt-auto">
                <button type="button" className="flex-1 bg-transparent text-blue-500 border-2 border-blue-500 hover:bg-blue-100 inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none bg-blue-500 text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Guardando...' : 'Agendar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {actionModalOpen && selectedApp && (
        <div className="fixed top-0 left-0 w-full h-full bg-slate-900/40 backdrop-blur-sm animate-fade-in flex items-center justify-center z-[1000]">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] w-full max-w-[450px] mx-4 max-h-[90vh] animate-fade-in-up flex flex-col overflow-hidden">
            <div className="p-8 pb-4 shrink-0 border-b border-slate-100">
              <h2 className="text-2xl font-bold mb-2">Opciones de Cita</h2>
              <p className="text-slate-500 m-0">
                Cliente: <strong>{selectedApp.clientName}</strong>
              </p>
            </div>
            
            <div className="p-8 py-4 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-4">
              {isCancelling ? (
                <>
                  <p className="text-slate-500 mb-2">
                    ¿Deseas cobrar una penalización por cancelación? (Ej. no-show).
                    Deja en $0 o vacío si la cancelación es gratuita.
                  </p>
                  
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                    placeholder="Monto de penalidad ($0)"
                    value={penaltyFee}
                    onChange={(e) => setPenaltyFee(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <Select
                    isMulti={true}
                    value={checkoutServiceIds}
                    onChange={val => setCheckoutServiceIds(val)}
                    placeholder="Servicios Finales (Ajustar si es necesario)"
                    options={services?.map(s => ({ value: s.id, label: `${s.name} ($${s.price})` })) || []}
                  />
                </>
              )}
            </div>

            <div className="p-8 pt-4 shrink-0 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-3 mt-auto">
              {isCancelling ? (
                <>
                  <button 
                    className="w-full bg-blue-500 text-white hover:bg-blue-600 inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none"
                    onClick={() => {
                      updateStatusMutation.mutate({ 
                        id: selectedApp.id, 
                        status: 'Cancelled',
                        penaltyFee: penaltyFee ? parseFloat(penaltyFee) : 0
                      });
                    }}
                    disabled={updateStatusMutation.isPending}
                  >
                    Confirmar Cancelación
                  </button>
                  
                  <button 
                    className="w-full bg-transparent text-slate-600 hover:bg-slate-200 inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer" 
                    onClick={() => {
                      setIsCancelling(false);
                      setPenaltyFee('');
                    }}
                    disabled={updateStatusMutation.isPending}
                  >
                    Atrás
                  </button>
                </>
              ) : (
                <>
                  {JSON.stringify([...checkoutServiceIds].sort()) !== JSON.stringify([...(selectedApp.serviceIds || [])].sort()) && (
                    <button 
                      className="w-full bg-blue-500 text-white hover:bg-blue-600 inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none"
                      onClick={() => updateStatusMutation.mutate({ id: selectedApp.id, status: 'Scheduled', finalServiceIds: checkoutServiceIds })}
                      disabled={updateStatusMutation.isPending || checkoutServiceIds.length === 0}
                    >
                      Guardar Cambios en Servicios
                    </button>
                  )}
                  
                  <button 
                    className="w-full bg-green-500 text-white hover:bg-green-600 inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none"
                    onClick={() => updateStatusMutation.mutate({ id: selectedApp.id, status: 'Completed', finalServiceIds: checkoutServiceIds })}
                    disabled={updateStatusMutation.isPending || checkoutServiceIds.length === 0}
                  >
                    <CheckCircle size={20} /> Completar y Cobrar (${calculateCheckoutTotal()})
                  </button>
                  
                  <div className="flex gap-3">
                    <button 
                      className="flex-1 bg-transparent text-blue-500 border-2 border-blue-500 hover:bg-blue-50 inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer"
                      onClick={() => setIsCancelling(true)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <XCircle size={20} /> Cancelar Cita
                    </button>

                    <button 
                      className="flex-1 bg-transparent text-slate-600 hover:bg-slate-200 inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer"
                      onClick={() => {
                        setActionModalOpen(false);
                        setIsCancelling(false);
                        setPenaltyFee('');
                      }}
                    >
                      Cerrar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
