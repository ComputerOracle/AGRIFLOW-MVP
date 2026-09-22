import { useRef, useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LOCALE_LABELS, type Locale } from '../../i18n/translations';

const LOCALES = Object.entries(LOCALE_LABELS) as [Locale, string][];

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-50 text-xs font-medium"
        title="Change language"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline uppercase">{locale}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {LOCALES.map(([code, label]) => (
            <button
              key={code}
              type="button"
              onClick={() => { setLocale(code); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-gray-50 ${
                code === locale ? 'text-agri-700 font-semibold bg-agri-50' : 'text-gray-700'
              }`}
            >
              <span>{label}</span>
              {code === locale && <span className="text-agri-600">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
