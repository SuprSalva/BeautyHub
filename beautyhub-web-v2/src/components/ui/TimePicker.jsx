import React, { useState, useEffect, useRef } from 'react';

const Wheel = ({ options, value, onChange }) => {
  const containerRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef(null);
  
  // Drag state
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTopRef = useRef(0);

  useEffect(() => {
    if (!isScrolling && !isDragging.current && containerRef.current) {
      const index = options.indexOf(value);
      if (index !== -1) {
        containerRef.current.scrollTop = index * 40;
      }
    }
  }, [value, isScrolling, options]);

  const handleScroll = () => {
    if (isDragging.current) return;
    setIsScrolling(true);
    clearTimeout(scrollTimeout.current);
    
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const index = Math.round(scrollTop / 40);
        if (options[index] && options[index] !== value) {
          onChange(options[index]);
        }
      }
    }, 150);
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startY.current = e.pageY - containerRef.current.offsetTop;
    scrollTopRef.current = containerRef.current.scrollTop;
    
    // Disable smooth scrolling during drag for better feel
    containerRef.current.style.scrollBehavior = 'auto';
    containerRef.current.style.scrollSnapType = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const y = e.pageY - containerRef.current.offsetTop;
    const walk = (y - startY.current) * 1.5;
    containerRef.current.scrollTop = scrollTopRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    if (containerRef.current) {
      containerRef.current.style.scrollBehavior = 'smooth';
      containerRef.current.style.scrollSnapType = 'y mandatory';
      
      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / 40);
      if (options[index]) {
        containerRef.current.scrollTop = index * 40;
        if (options[index] !== value) {
          onChange(options[index]);
        }
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      className="h-[120px] overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar w-full relative z-10 select-none cursor-grab active:cursor-grabbing"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <div className="h-[40px]" /> {/* Spacer */}
      {options.map((opt) => (
        <div 
          key={opt} 
          className={`h-[40px] snap-center flex items-center justify-center text-lg transition-all duration-200 pointer-events-none ${value === opt ? 'font-bold text-slate-900 scale-110' : 'font-medium text-slate-400'}`}
        >
          {opt}
        </div>
      ))}
      <div className="h-[40px]" /> {/* Spacer */}
    </div>
  );
};

const TimePicker = ({ value, onChange }) => {
  const [hours, setHours] = useState('09');
  const [minutes, setMinutes] = useState('00');
  const [period, setPeriod] = useState('AM');

  useEffect(() => {
    if (value) {
      const [timeStr, p] = value.split(' ');
      if (timeStr && p) {
        const [h, m] = timeStr.split(':');
        setHours(h);
        setMinutes(m);
        setPeriod(p);
      }
    }
  }, [value]);

  const updateTime = (h, m, p) => {
    setHours(h);
    setMinutes(m);
    setPeriod(p);
    onChange(`${h}:${m} ${p}`);
  };

  const hourOptions = Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0'));
  // Let's do 15-min intervals for the agenda to avoid a massive list, or every 5 mins.
  const minuteOptions = ['00', '15', '30', '45']; 
  const periodOptions = ['AM', 'PM'];

  return (
    <div className="relative flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-200 py-4 px-2 h-[160px] overflow-hidden">
      <span className="absolute top-2 left-4 text-xs font-bold text-slate-400">Hora de la Cita</span>
      
      {/* Selection Highlight Bar */}
      <div className="absolute top-1/2 left-4 right-4 h-[44px] -translate-y-1/2 bg-white rounded-xl shadow-sm border border-slate-200 pointer-events-none" />
      
      {/* Wheels Wrapper with Fade Mask */}
      <div 
        className="flex w-full gap-1 relative z-10 mt-3 px-2"
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)', maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
      >
        <div className="flex-1">
          <Wheel options={hourOptions} value={hours} onChange={(v) => updateTime(v, minutes, period)} />
        </div>
        <div className="flex items-center justify-center font-bold text-slate-300 text-xl pb-1 -mt-[2px]">:</div>
        <div className="flex-1">
          <Wheel options={minuteOptions} value={minutes} onChange={(v) => updateTime(hours, v, period)} />
        </div>
        <div className="flex-1 ml-1">
          <Wheel options={periodOptions} value={period} onChange={(v) => updateTime(hours, minutes, v)} />
        </div>
      </div>
    </div>
  );
};

export default TimePicker;
