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
    const selectedValue = e.target.value;
    // Try to convert to number if it looks like a number
    const parsed = !isNaN(selectedValue) && selectedValue !== '' 
      ? Number(selectedValue) 
      : selectedValue;
    onChange(parsed);
  };

  const inputId = `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

  // Read-only mode: show selected option label as clean text
  if (readOnly) {
    const selectedOption = options.find(o => String(o.value) === String(value));
    const displayValue = selectedOption ? selectedOption.label : (value || '—');
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
          fontStyle: value ? 'normal' : 'italic',
        }}>
          {displayValue}
        </div>
      </div>
    );
  }

  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={inputId} className="form-field__label">
        {label}
        {required && <span className="form-field__required">*</span>}
      </label>
      <div className="select-wrapper">
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
