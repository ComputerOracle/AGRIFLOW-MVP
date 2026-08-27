import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const VARIANT_STYLES = {
  primary: 'bg-agri-600 text-white hover:bg-agri-700 border-transparent shadow-sm',
  secondary: 'bg-agri-50 text-agri-700 hover:bg-agri-100 border-agri-200',
  outline: 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 border-transparent',
  danger: 'bg-red-600 text-white hover:bg-red-700 border-transparent shadow-sm',
  warning: 'bg-amber-500 text-white hover:bg-amber-600 border-transparent shadow-sm',
};

const SIZE_STYLES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-2.5 text-sm rounded-lg font-medium',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium border transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${className}
      `}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      {children}
    </button>
  );
}
