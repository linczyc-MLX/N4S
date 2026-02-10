import React from 'react';
import { ChevronDown } from 'lucide-react';

const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  required = false,
  disabled = false,
  readOnly = false,
  helpText,
  error,
  className = '',
}) => {
  const handleChange = (e) => {
    if (readOnly) return; // Intake-locked: ignore input, field looks unchanged
    const selectedValue = e.target.value;
    const parsed = !isNaN(selectedValue) && selectedValue !== '' 
      ? Number(selectedValue) 
      : selectedValue;
    onChange(parsed);
  };

  const inputId = `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={inputId} className="form-field__label">
        {label}
        {required && <span className="form-field__required">*</span>}
      </label>
      <div className="select-wrapper" style={readOnly ? { pointerEvents: 'none' } : undefined}>
        <select
          id={inputId}
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          className={`form-field__select ${error ? 'form-field__select--error' : ''}`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="select-wrapper__icon" size={18} />
      </div>
      {helpText && !error && (
        <span className="form-field__help">{helpText}</span>
      )}
      {error && (
        <span className="form-field__error">{error}</span>
      )}
    </div>
  );
};

export default SelectField;
