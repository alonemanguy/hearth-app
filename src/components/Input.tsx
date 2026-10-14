import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  id?: string;
  error?: string | null;
  required?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  id,
  error,
  required,
  autoComplete,
  autoFocus,
}: Props) {
  const reduce = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id ?? `input-${slugify(label)}`;
  const errorId = `${inputId}-error`;
  const isPassword = type === 'password';
  const actualType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="input-group">
      <label htmlFor={inputId}>
        {label}
        {required && <span className="input-required"> *</span>}
      </label>
      <div
        className={`input-wrap ${error ? 'input-wrap--error' : ''} ${
          isPassword ? 'input-wrap--password' : ''
        }`}
      >
        <input
          id={inputId}
          type={actualType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          aria-required={required}
        />
        {isPassword && (
          <button
            type="button"
            className="input-toggle"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && (
        <motion.p
          id={errorId}
          className="input-error"
          role="alert"
          initial={reduce ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

export default Input;