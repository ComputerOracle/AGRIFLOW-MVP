interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={`
          w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900
          placeholder:text-gray-400 transition-colors
          focus:outline-none focus:ring-2 focus:ring-agri-500 focus:border-agri-500
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-gray-300'}
          ${className}
        `}
      />
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export function Select({ label, error, children, className = '', id, ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={inputId}
        {...props}
        className={`
          w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900
          focus:outline-none focus:ring-2 focus:ring-agri-500 focus:border-agri-500
          disabled:bg-gray-50
          ${error ? 'border-red-400' : 'border-gray-300'}
          ${className}
        `}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        {...props}
        className={`
          w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-900
          placeholder:text-gray-400 resize-none
          focus:outline-none focus:ring-2 focus:ring-agri-500 focus:border-agri-500
          ${error ? 'border-red-400' : 'border-gray-300'}
          ${className}
        `}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
