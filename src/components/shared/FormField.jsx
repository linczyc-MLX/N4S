import React from 'react';

const FormField = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  helpText,
  error,
  rows = 3,
  min,
  max,
  step,
  className = '',
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const inputId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  // Read-only mode: render value as clean styled text
  if (readOnly) {
    const displayValue = value || '—';
    return (
      <div className={`form-field ${className}`}>
        <label className="form-field__label" style={{ opacity: 0.7 }}>
          {label}
        </label>
        <div style={{
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.06)',
          color: value ? '#e5e7eb' : '#6b7280',
          fontSize: '13px',
          lineHeight: '1.5',
          minHeight: type === 'textarea' ? '60px' : 'auto',
          fontStyle: value ? 'normal' : 'italic',
        }}>
          {displayValue}
        </div>
      </div>
    );
  }

  const renderInput = () => {
    const baseProps = {
      id: inputId,
      value: value || '',
      onChange: handleChange,
      placeholder,
      disabled,
      className: `form-field__input ${error ? 'form-field__input--error' : ''}`,
    };

    if (type === 'textarea') {
      return (
        <textarea
          {...baseProps}
          rows={rows}
        />
      );
    }

    return (
      <input
        {...baseProps}
        type={type}
        min={min}
        max={max}
        step={step}
      />
    );
  };

  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={inputId} className="form-field__label">
        {label}
        {required && <span className="form-field__required">*</span>}
      </label>
      {renderInput()}
      {helpText && !error && (
        <span className="form-field__help">{helpText}</span>
      )}
      {error && (
        <span className="form-field__error">{error}</span>
      )}
    </div>
  );
};

export default FormField;
