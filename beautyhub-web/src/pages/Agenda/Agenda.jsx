import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarX2, User, Scissors, CheckCircle, XCircle } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale';

registerLocale('es', es);
import { fetchAgenda, fetchServices, fetchEmployees, createAppointment, updateAppointmentStatus } from '../../api';

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
      queryClient.invalidateQueries({ queryKey: ['agenda', selectedDate] });
      setIsModalOpen(false);
      setBookingForm({ clientName: '', serviceIds: [], employeeId: '', time: '', date: '' });
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
    <div className="agenda-page">
      <header className="page-header">
        <div>
          <h1>Agenda</h1>
          <p className="text-muted">Gestiona las citas programadas.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', border: '1px solid var(--surface-300)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button 
              className={`btn ${viewMode === 'day' ? 'btn-primary' : ''}`}
              style={{ borderRadius: 0, padding: '0.5rem 1rem', background: viewMode === 'day' ? 'var(--brand-primary)' : 'transparent', color: viewMode === 'day' ? 'white' : 'var(--text-main)', border: 'none' }}
              onClick={() => setViewMode('day')}
            >Día</button>
            <button 
              className={`btn ${viewMode === 'upcoming' ? 'btn-primary' : ''}`}
              style={{ borderRadius: 0, padding: '0.5rem 1rem', background: viewMode === 'upcoming' ? 'var(--brand-primary)' : 'transparent', color: viewMode === 'upcoming' ? 'white' : 'var(--text-main)', border: 'none' }}
              onClick={() => setViewMode('upcoming')}
            >Próximas</button>
          </div>
          {viewMode === 'day' && (
            <div style={{ width: '150px' }}>
              <DatePicker 
                locale="es"
                dateFormat="dd/MMM/yyyy"
                selected={selectedDate ? new Date(selectedDate + 'T12:00:00') : null}
                onChange={(date) => setSelectedDate(getLocalDateStr(date))}
                className="input-field"
                dateFormat="dd/MM/yyyy"
              />
            </div>
          )}
          <button className="btn btn-primary" onClick={() => {
            setBookingForm({ ...bookingForm, date: selectedDate });
            setIsModalOpen(true);
          }}>+ Nueva Cita</button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 3 }}>
          {isLoading ? (
            <p>Cargando citas...</p>
          ) : appointments?.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ marginBottom: '1rem', color: 'var(--brand-primary)' }}>
                <CalendarX2 size={48} />
              </div>
              <h3>Día Libre</h3>
              <p className="text-muted">No hay citas programadas para este día.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {appointments?.map(app => (
                <div 
                  key={app.id} 
                  className="glass-panel" 
                  style={{ display: 'flex', padding: 0, overflow: 'hidden', cursor: app.status === 'Scheduled' ? 'pointer' : 'default', opacity: app.status === 'Cancelled' ? 0.6 : 1 }}
                  onClick={() => {
                    if (app.status === 'Scheduled') {
                      setSelectedApp(app);
                      setCheckoutServiceIds(app.serviceIds || []);
                      setActionModalOpen(true);
                    }
                  }}
                >
                  <div style={{ 
                    backgroundColor: 'var(--brand-primary-light)', 
                    color: 'var(--brand-primary)', 
                    padding: '1.5rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    minWidth: '120px',
                    fontWeight: 700
                  }}>
                    {viewMode === 'upcoming' && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--brand-primary)', opacity: 0.8 }}>
                        {formatDate(app.startTime)}
                      </div>
                    )}
                    <div>{formatTime(app.startTime)}</div>
                  </div>
                  
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0', textDecoration: app.status === 'Cancelled' ? 'line-through' : 'none' }}>{app.serviceName}</h3>
                      <p className="text-muted" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <User size={14} /> Cliente: {app.clientName}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge" style={{ backgroundColor: 'var(--surface-200)', color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Scissors size={14} /> {app.employeeName}
                      </span>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: app.status === 'Completed' ? 'var(--success)' : app.status === 'Cancelled' ? 'var(--danger)' : 'var(--warning)' }}>
                        {app.status === 'Scheduled' ? 'Pendiente' : app.status === 'Completed' ? 'Completada' : 'Cancelada'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              Resumen del Día
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="text-muted">Total Citas:</span>
              <strong>{totalAppointments}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="text-muted">Confirmadas:</span>
              <strong style={{ color: 'var(--success)' }}>{totalAppointments}</strong>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '450px', padding: '2rem', background: 'white' }}>
            <h2>Agendar Cita Manual</h2>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>Selecciona la fecha y hora de la cita.</p>
            
            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: '100%' }}>
                <DatePicker 
                  locale="es"
                  dateFormat="dd/MMM/yyyy"
                  selected={bookingForm.date ? new Date(bookingForm.date + 'T12:00:00') : null}
                  onChange={(date) => setBookingForm({...bookingForm, date: getLocalDateStr(date)})}
                  className="input-field"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Fecha de la Cita"
                  required
                />
              </div>
              <input 
                className="input-field" placeholder="Nombre del Cliente" required
                value={bookingForm.clientName} onChange={e => setBookingForm({...bookingForm, clientName: e.target.value})} 
              />
              
              <div style={{ border: '1px solid var(--surface-300)', padding: '0.5rem', borderRadius: 'var(--radius-md)', maxHeight: '150px', overflowY: 'auto' }}>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Servicios (Selecciona 1 o más)</p>
                {services?.map(s => (
                  <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input 
                      type="checkbox"
                      checked={bookingForm.serviceIds.includes(s.id)}
                      onChange={(e) => {
                        const newIds = e.target.checked 
                          ? [...bookingForm.serviceIds, s.id]
                          : bookingForm.serviceIds.filter(id => id !== s.id);
                        setBookingForm({...bookingForm, serviceIds: newIds});
                      }}
                    />
                    {s.name} (${s.price})
                  </label>
                ))}
              </div>

              <select 
                className="input-field" required
                value={bookingForm.employeeId} onChange={e => setBookingForm({...bookingForm, employeeId: e.target.value})}
              >
                <option value="">Selecciona un Profesional</option>
                {employees?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>

              <select 
                className="input-field" required
                value={bookingForm.time} onChange={e => setBookingForm({...bookingForm, time: e.target.value})}
              >
                <option value="">Selecciona la Hora</option>
                {mockTimes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={mutation.isPending}>
                  {mutation.isPending ? 'Guardando...' : 'Agendar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {actionModalOpen && selectedApp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '450px', padding: '2rem', background: 'white' }}>
            <h2>Opciones de Cita</h2>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Cliente: <strong>{selectedApp.clientName}</strong>
            </p>
            
            {isCancelling ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p className="text-muted" style={{ marginBottom: '0.5rem' }}>
                  ¿Deseas cobrar una penalización por cancelación? (Ej. no-show).
                  Deja en $0 o vacío si la cancelación es gratuita.
                </p>
                
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-field"
                  placeholder="Monto de penalidad ($0)"
                  value={penaltyFee}
                  onChange={(e) => setPenaltyFee(e.target.value)}
                />

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', backgroundColor: 'var(--danger)', border: 'none', display: 'flex', justifyContent: 'center' }}
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
                  className="btn btn-outline" 
                  style={{ width: '100%' }}
                  onClick={() => {
                    setIsCancelling(false);
                    setPenaltyFee('');
                  }}
                  disabled={updateStatusMutation.isPending}
                >
                  Atrás
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ border: '1px solid var(--surface-300)', padding: '0.5rem', borderRadius: 'var(--radius-md)', maxHeight: '150px', overflowY: 'auto', marginBottom: '0.5rem' }}>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Servicios Finales (Ajustar si es necesario)</p>
                  {services?.map(s => (
                    <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input 
                        type="checkbox"
                        checked={checkoutServiceIds.includes(s.id)}
                        onChange={(e) => {
                          const newIds = e.target.checked 
                            ? [...checkoutServiceIds, s.id]
                            : checkoutServiceIds.filter(id => id !== s.id);
                          setCheckoutServiceIds(newIds);
                        }}
                      />
                      {s.name} (${s.price})
                    </label>
                  ))}
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', backgroundColor: 'var(--success)', border: 'none', display: 'flex', justifyContent: 'center' }}
                  onClick={() => updateStatusMutation.mutate({ id: selectedApp.id, status: 'Completed', finalServiceIds: checkoutServiceIds })}
                  disabled={updateStatusMutation.isPending || checkoutServiceIds.length === 0}
                >
                  <CheckCircle size={20} /> Completar y Cobrar (${calculateCheckoutTotal()})
                </button>
                
                <button 
                  className="btn btn-outline" 
                  style={{ width: '100%', borderColor: 'var(--danger)', color: 'var(--danger)', display: 'flex', justifyContent: 'center' }}
                  onClick={() => setIsCancelling(true)}
                  disabled={updateStatusMutation.isPending}
                >
                  <XCircle size={20} /> Cancelar Cita
                </button>

                <button 
                  className="btn btn-outline" 
                  style={{ width: '100%', marginTop: '1rem' }}
                  onClick={() => {
                    setActionModalOpen(false);
                    setIsCancelling(false);
                    setPenaltyFee('');
                  }}
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
