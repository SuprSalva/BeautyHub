import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAgenda, fetchDashboardReports } from '../../api';
import { Users, Calendar, DollarSign, TrendingUp, ArrowUpCircle, ArrowDownCircle, Info } from 'lucide-react';

const getLocalDateStr = (d = new Date()) => {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

const Inicio = () => {
  const today = getLocalDateStr();
  
  // Fetch Citas (For the "Próximas Citas Hoy" list)
  const { data: appointments, isLoading: isLoadingCitas } = useQuery({
    queryKey: ['agenda', 'day', today],
    queryFn: () => fetchAgenda(today, 'day')
  });

  // Fetch Dashboard Reports (For the KPI Cards and Recent Transactions)
  const { data: reports, isLoading: isLoadingReports } = useQuery({
    queryKey: ['dashboardReports'],
    queryFn: fetchDashboardReports
  });

  // Próximas citas de hoy a partir de ahora
  const now = new Date();
  const proximasCitasHoy = appointments?.filter(app => new Date(app.startTime) >= now).slice(0, 3) || [];

  const isLoading = isLoadingCitas || isLoadingReports;

  const stats = reports ? [
    { title: 'Ingresos de Hoy', value: `$${reports.todayRevenue}`, info: 'Suma de todas las transacciones de ingreso (Caja) registradas el día de hoy.', icon: <DollarSign size={24} />, bgClass: 'bg-emerald-500/15', textClass: 'text-emerald-500' },
    { title: 'Citas de Hoy', value: reports.todayAppointments, info: 'Total de citas agendadas cuya hora de inicio es durante el día de hoy.', icon: <Calendar size={24} />, bgClass: 'bg-blue-500/15', textClass: 'text-blue-500' },
    { title: 'Ingresos (7 días)', value: `$${reports.weekRevenue}`, info: 'Suma de todas las transacciones de ingreso (Caja) en los últimos 7 días.', icon: <TrendingUp size={24} />, bgClass: 'bg-cyan-500/15', textClass: 'text-cyan-500' },
    { title: 'Total Clientes', value: reports.totalClients, info: 'Número total de personas registradas con el rol de Cliente en tu estética.', icon: <Users size={24} />, bgClass: 'bg-slate-900/15', textClass: 'text-slate-900' },
  ] : [];

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Inicio</h1>
        <p className="text-slate-500 mt-1">Resumen del día para tu salón.</p>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-slate-500 font-medium text-sm">{stat.title}</h3>
                    <div className="group/tooltip relative inline-flex text-slate-400 hover:text-slate-600 cursor-help">
                      <Info size={14} />
                      <span className="invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 absolute z-[100] bottom-[125%] left-1/2 -translate-x-1/2 group-hover/tooltip:translate-y-0 translate-y-[10px] w-max max-w-[250px] bg-slate-900 text-white text-left rounded-xl px-4 py-3 text-[0.85rem] font-normal leading-relaxed shadow-lg transition-all duration-200 after:content-[''] after:absolute after:top-full after:left-1/2 after:-ml-[5px] after:border-[5px] after:border-solid after:border-t-slate-900 after:border-r-transparent after:border-b-transparent after:border-l-transparent">{stat.info}</span>
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.bgClass} ${stat.textClass}`}>
                    {React.cloneElement(stat.icon, { size: 20 })}
                  </div>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</span>
                </div>

                <div className={`absolute -bottom-4 -right-4 opacity-[0.03] transform group-hover:scale-110 transition-transform duration-500 pointer-events-none ${stat.textClass}`}>
                  {React.cloneElement(stat.icon, { size: 120, strokeWidth: 1.5 })}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Próximas Citas */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Calendar size={18} className="text-blue-500" />
                  Próximas Citas Hoy
                </h3>
                <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full">
                  {proximasCitasHoy.length} restantes
                </span>
              </div>
              
              <div className="p-6 flex-1">
                {proximasCitasHoy.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Calendar size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">No hay más citas registradas por hoy.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proximasCitasHoy.map((app, idx) => (
                      <div key={app.id} className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shadow-inner">
                            {app.clientName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong className="block text-slate-800 text-base mb-0.5 group-hover:text-blue-600 transition-colors">{app.serviceName}</strong>
                            <span className="text-slate-500 text-sm">{app.clientName}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <strong className="text-blue-600 text-lg tracking-tight block">{formatTime(app.startTime)}</strong>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">Confirmada</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Últimos Movimientos */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <DollarSign size={18} className="text-blue-500" />
                  Últimos Movimientos
                </h3>
              </div>
              
              <div className="p-0 flex-1">
                {!reports?.recentTransactions || reports.recentTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 py-14">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <DollarSign size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">No hay movimientos financieros recientes.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {reports.recentTransactions.map((t, idx) => (
                      <div key={t.id} className="flex justify-between items-center p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex gap-4 items-center">
                          <div className={`p-2.5 rounded-full shadow-inner ${t.type === 'Income' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                            {t.type === 'Income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                          </div>
                          <div>
                            <strong className="block text-slate-800 text-sm mb-0.5">{t.description}</strong>
                            <span className="text-slate-400 text-xs">{formatDateTime(t.date)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <strong className={`text-base tracking-tight ${t.type === 'Income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {t.type === 'Income' ? '+' : '-'}${t.amount}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Inicio;
