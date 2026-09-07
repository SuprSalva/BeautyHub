import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Select = ({ options, value, onChange, placeholder = 'Selecciona una opción', className = '', isMulti = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayValue = () => {
    if (isMulti) {
      if (!value || value.length === 0) return null;
      if (value.length === 1) return options.find(o => o.value === value[0])?.label;
      return `${value.length} seleccionados`;
    }
    const selectedOption = options.find(opt => opt.value === value);
    return selectedOption ? selectedOption.label : null;
  };

  const displayValue = getDisplayValue();

  return (
    <div className={`relative w-full ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-5 py-[0.85rem] rounded-xl border bg-white text-base transition-all duration-150 focus:outline-none ${isOpen ? 'border-blue-500 ring-3 ring-blue-100' : 'border-slate-300 hover:border-slate-400'}`}
      >
        <span className={displayValue ? 'text-slate-900' : 'text-slate-500'}>
          {displayValue || placeholder}
        </span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[1200] mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] py-2 animate-fade-in-up origin-top max-h-[300px] overflow-y-auto custom-scrollbar">
          {options.map((opt) => {
            const isActive = isMulti ? value.includes(opt.value) : value === opt.value;
            
            return (
              <button
                key={opt.value}
                type="button"
                className={`w-full text-left px-5 py-3 flex items-center justify-between transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                onClick={() => {
                  if (isMulti) {
                    const newValue = isActive 
                      ? value.filter(v => v !== opt.value) 
                      : [...value, opt.value];
                    onChange(newValue);
                  } else {
                    onChange(opt.value);
                    setIsOpen(false);
                  }
                }}
              >
                {opt.label}
                {isActive && <Check size={16} className="text-blue-500 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Select;
