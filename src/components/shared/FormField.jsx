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

  const isDisabled = disabled || readOnly;

  const renderInput = () => {
    const baseProps = {
      id: inputId,
      value: value || '',
      onChange: handleChange,
      placeholder,
      disabled: isDisabled,
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
