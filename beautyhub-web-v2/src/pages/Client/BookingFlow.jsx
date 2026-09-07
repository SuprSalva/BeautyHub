import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Scissors, CheckCircle2, MessageCircle } from 'lucide-react';
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
    <div className="max-w-[600px] mx-auto my-8 px-4">
      <header className="text-center mb-8">
        <h2>{salonName}</h2>
        <p className="text-slate-500">Reserva tu cita en 3 pasos</p>
      </header>

      <div className="animate-fade-in">
        {step === 1 && (
          <div className="flex flex-col">
            <h3>1. Elige tus servicios</h3>
            <p className="text-slate-500 mb-4">Puedes seleccionar más de uno.</p>
            {isLoadingServices ? <p>Cargando servicios...</p> : (
              <div className="flex flex-col gap-4 mt-4">
                {services?.length === 0 && <p className="text-slate-500">No hay servicios disponibles.</p>}
                {services?.map(srv => {
                  const isSelected = booking.services.some(s => s.id === srv.id);
                  return (
                    <div 
                      key={srv.id} 
                      className={`flex items-center p-4 cursor-pointer transition-all duration-150 hover:translate-x-[5px] hover:border-blue-500 bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg ${isSelected ? 'border-blue-500 bg-blue-50' : ''}`}
                      onClick={() => toggleService(srv)}
                    >
                      <div className="text-3xl mr-4 text-blue-500">
                        <Scissors size={24} />
                      </div>
                      <div className="flex-1">
                        <h4>{srv.name}</h4>
                        <p className="text-slate-500">{srv.durationMinutes} min</p>
                      </div>
                      <div className="font-bold text-blue-500">${srv.price}</div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {booking.services.length > 0 && (
              <div className="mt-8 flex justify-between items-center">
                <div>
                  <strong>Total:</strong> ${totalPrice} <br/>
                  <small className="text-slate-500">{totalDuration} min</small>
                </div>
                <button className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none bg-blue-500 text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]" onClick={handleNext}>Continuar &rarr;</button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col">
            <button className="self-start bg-transparent border-none text-slate-500 cursor-pointer text-base hover:text-blue-500" onClick={handleBack}>&larr; Volver</button>
            <h3 className="mt-4">2. Selecciona un profesional</h3>
            {isLoadingEmployees ? <p>Cargando...</p> : (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mt-4">
                {employees?.length === 0 && <p className="text-slate-500">No hay empleados disponibles.</p>}
                {employees?.map(emp => (
                  <div 
                    key={emp.id} 
                    className={`p-6 text-center cursor-pointer bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg ${booking.employee?.id === emp.id ? 'border-blue-500 bg-blue-50' : ''}`}
                    onClick={() => { setBooking({ ...booking, employee: emp }); handleNext(); }}
                  >
                    <div className="w-[60px] h-[60px] rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl mx-auto mb-4">{emp.name.charAt(0)}</div>
                    <div>
                      <h4>{emp.name}</h4>
                      <p className="text-slate-500">Profesional</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col">
            <button className="self-start bg-transparent border-none text-slate-500 cursor-pointer text-base hover:text-blue-500" onClick={handleBack}>&larr; Volver</button>
            <h3 className="mt-4">3. Fecha y Hora</h3>
            
            <div className="w-full mb-6">
              <DatePicker 
                locale="es"
                dateFormat="dd/MMM/yyyy"
                selected={booking.date ? new Date(booking.date + 'T12:00:00') : null}
                onChange={date => setBooking({ ...booking, date: getLocalDateStr(date) })}
                className="w-full px-5 py-[0.85rem] rounded-xl border border-slate-300 bg-white text-base transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                minDate={new Date()}
                placeholderText="Selecciona un día"
              />
            </div>

            {booking.date && (
              <div className="grid grid-cols-3 gap-2">
                {mockTimes.map(time => (
                  <button 
                    key={time} 
                    className={`p-3 border border-slate-300 bg-white rounded-xl cursor-pointer font-semibold text-slate-900 transition-all duration-150 hover:border-blue-500 ${booking.time === time ? 'border-blue-500 bg-blue-50' : ''}`}
                    onClick={() => setBooking({ ...booking, time })}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}

            {booking.time && (
              <button 
                className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none bg-blue-500 text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:-translate-y-[2px] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-fade-in w-full mt-8 p-4"
                onClick={confirmBooking}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Confirmando...' : 'Confirmar Cita'}
              </button>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center text-center h-[60vh]">
            <div className="mb-4 text-green-500">
              <CheckCircle2 size={64} />
            </div>
            <h2 className="bg-gradient-to-br from-blue-500 to-cyan-500 bg-clip-text text-transparent">¡Cita Confirmada!</h2>
            <p className="text-slate-500 mt-4">
              Te esperamos el <strong>{booking.date}</strong> a las <strong>{booking.time}</strong> con <strong>{booking.employee?.name}</strong>.
            </p>
            <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg mt-8 p-6 text-left w-full">
              <h4>Resumen de Servicios</h4>
              <ul className="list-none p-0 mt-4">
                {booking.services.map(s => (
                  <li key={s.id} className="flex justify-between mb-2">
                    <span>{s.name}</span>
                    <strong>${s.price}</strong>
                  </li>
                ))}
                <li className="flex justify-between mt-4 pt-4 border-t border-slate-200">
                  <strong>Total:</strong>
                  <strong className="text-blue-500">${totalPrice}</strong>
                </li>
              </ul>
            </div>
            <a 
              href={`https://wa.me/?text=Hola, acabo de agendar una cita para el ${booking.date} a las ${booking.time} con ${booking.employee?.name} en ${salonName}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 gap-2 cursor-pointer border-none bg-emerald-500 text-white shadow-[0_4px_10px_rgba(16,185,129,0.3)] hover:bg-emerald-600 hover:-translate-y-[2px] no-underline w-full"
            >
              <MessageCircle size={20} />
              Enviar mensaje al salón
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFlow;
