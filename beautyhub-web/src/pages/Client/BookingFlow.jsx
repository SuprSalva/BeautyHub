import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Scissors, CheckCircle2 } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale';

registerLocale('es', es);
import { fetchServices, fetchEmployees, createAppointment } from '../../api';

const getLocalDateStr = (d = new Date()) => {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

const mockTimes = ['09:00 AM', '10:00 AM', '11:30 AM', '04:00 PM'];

const BookingFlow = () => {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState({ services: [], employee: null, date: '', time: '' });
  
  // Extraer nombre del tenant del subdominio para la UI
  const host = window.location.hostname;
  const rawSubdomain = host.split('.')[0];
  const salonName = rawSubdomain === 'localhost' || rawSubdomain === '127' ? 'Mi Salón' : 
    rawSubdomain.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Data Fetching
  const { data: services, isLoading: isLoadingServices } = useQuery({ queryKey: ['services'], queryFn: fetchServices });
  const { data: employees, isLoading: isLoadingEmployees } = useQuery({ queryKey: ['employees'], queryFn: fetchEmployees });

  // Mutation for creating appointment
  const mutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      setStep(4); // Show success screen
    }
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const toggleService = (srv) => {
    const isSelected = booking.services.find(s => s.id === srv.id);
    if (isSelected) {
      setBooking({ ...booking, services: booking.services.filter(s => s.id !== srv.id) });
    } else {
      setBooking({ ...booking, services: [...booking.services, srv] });
    }
  };

  const confirmBooking = () => {
    // Generate dummy dates based on selected time string
    const [time, period] = booking.time.split(' ');
    let [hours, minutes] = time.split(':');
    if (period === 'PM' && hours !== '12') hours = parseInt(hours) + 12;
    if (period === 'AM' && hours === '12') hours = '00';
    
    const startTime = new Date(`${booking.date}T${hours}:${minutes}:00`).toISOString();

    mutation.mutate({
      serviceIds: booking.services.map(s => s.id),
      employeeId: booking.employee.id,
      startTime: startTime,
      clientName: "Cliente Invitado",
      clientEmail: "invitado@test.com",
      clientPhone: "555-1234"
    });
  };

  const totalDuration = booking.services.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalPrice = booking.services.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="booking-container">
      <header className="booking-header">
        <h2>{salonName}</h2>
        <p className="text-muted">Reserva tu cita en 3 pasos</p>
      </header>

      <div className="booking-steps animate-fade-in">
        {step === 1 && (
          <div className="step-content">
            <h3>1. Elige tus servicios</h3>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>Puedes seleccionar más de uno.</p>
            {isLoadingServices ? <p>Cargando servicios...</p> : (
              <div className="services-grid">
                {services?.length === 0 && <p className="text-muted">No hay servicios disponibles.</p>}
                {services?.map(srv => {
                  const isSelected = booking.services.some(s => s.id === srv.id);
                  return (
                    <div 
                      key={srv.id} 
                      className={`service-card glass-panel ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleService(srv)}
                    >
                      <div className="service-icon" style={{ color: 'var(--brand-primary)' }}>
                        <Scissors size={24} />
                      </div>
                      <div className="service-info">
                        <h4>{srv.name}</h4>
                        <p className="text-muted">{srv.durationMinutes} min</p>
                      </div>
                      <div className="service-price">${srv.price}</div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {booking.services.length > 0 && (
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Total:</strong> ${totalPrice} <br/>
                  <small className="text-muted">{totalDuration} min</small>
                </div>
                <button className="btn btn-primary" onClick={handleNext}>Continuar &rarr;</button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <button className="btn-back" onClick={handleBack}>&larr; Volver</button>
            <h3 style={{ marginTop: '1rem' }}>2. Selecciona un profesional</h3>
            {isLoadingEmployees ? <p>Cargando...</p> : (
              <div className="employees-list">
                {employees?.length === 0 && <p className="text-muted">No hay empleados disponibles.</p>}
                {employees?.map(emp => (
                  <div 
                    key={emp.id} 
                    className={`employee-card glass-panel ${booking.employee?.id === emp.id ? 'selected' : ''}`}
                    onClick={() => { setBooking({ ...booking, employee: emp }); handleNext(); }}
                  >
                    <div className="avatar">{emp.name.charAt(0)}</div>
                    <div className="employee-info">
                      <h4>{emp.name}</h4>
                      <p className="text-muted">Profesional</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <button className="btn-back" onClick={handleBack}>&larr; Volver</button>
            <h3 style={{ marginTop: '1rem' }}>3. Fecha y Hora</h3>
            
            <div style={{ width: '100%', marginBottom: '1.5rem' }}>
              <DatePicker 
                locale="es"
                dateFormat="dd/MMM/yyyy"
                selected={booking.date ? new Date(booking.date + 'T12:00:00') : null}
                onChange={date => setBooking({ ...booking, date: getLocalDateStr(date) })}
                className="input-field"
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                placeholderText="Selecciona un día"
              />
            </div>

            {booking.date && (
              <div className="times-grid">
                {mockTimes.map(time => (
                  <button 
                    key={time} 
                    className={`time-slot ${booking.time === time ? 'selected' : ''}`}
                    onClick={() => setBooking({ ...booking, time })}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}

            {booking.time && (
              <button 
                className="btn btn-primary animate-fade-in" 
                style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}
                onClick={confirmBooking}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Confirmando...' : 'Confirmar Cita'}
              </button>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="step-content flex-center" style={{ flexDirection: 'column', textAlign: 'center', height: '60vh' }}>
            <div style={{ marginBottom: '1rem', color: 'var(--success)' }}>
              <CheckCircle2 size={64} />
            </div>
            <h2 className="text-gradient">¡Cita Confirmada!</h2>
            <p className="text-muted" style={{ marginTop: '1rem' }}>
              Te esperamos el <strong>{booking.date}</strong> a las <strong>{booking.time}</strong> con <strong>{booking.employee?.name}</strong>.
            </p>
            <div className="glass-panel" style={{ marginTop: '2rem', padding: '1.5rem', textAlign: 'left', width: '100%' }}>
              <h4>Resumen de Servicios</h4>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                {booking.services.map(s => (
                  <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>{s.name}</span>
                    <strong>${s.price}</strong>
                  </li>
                ))}
                <li style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                  <strong>Total:</strong>
                  <strong style={{ color: 'var(--brand-primary)' }}>${totalPrice}</strong>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFlow;
