import { IconEye, IconEyeOff } from './Icon'

export default function PasswordField({ label, value, onChange, visible, onToggleVisible, error, placeholder, helperText }) {
  return (
    <div className="password-field-root">
      {label && (
        <label className="field-label">
          <span>{label}</span>
          <div className="password-field">
            <input
              type={visible ? 'text' : 'password'}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className={error ? 'input-error' : ''}
              aria-invalid={!!error}
            />
            <button
              type="button"
              className="password-field__toggle"
              onClick={onToggleVisible}
              aria-label={visible ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {visible ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {error && <div className="field-error">{error}</div>}
          {helperText && <div className="field-helper">{helperText}</div>}
        </label>
      )}

      {!label && (
        <>
          <div className="password-field">
            <input
              type={visible ? 'text' : 'password'}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className={error ? 'input-error' : ''}
              aria-invalid={!!error}
            />
            <button
              type="button"
              className="password-field__toggle"
              onClick={onToggleVisible}
              aria-label={visible ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {visible ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {error && <div className="field-error">{error}</div>}
          {helperText && <div className="field-helper">{helperText}</div>}
        </>
      )}
    </div>
  )
}
