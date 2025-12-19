import React from 'react';

const SliderField = ({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  leftLabel,
  rightLabel,
  showValue = true,
  helpText,
  className = '',
}) => {
  const handleChange = (e) => {
    onChange(parseInt(e.target.value, 10));
  };

  const inputId = `slider-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`slider-field ${className}`}>
      <div className="slider-field__header">
        <label htmlFor={inputId} className="slider-field__label">
          {label}
        </label>
        {showValue && (
          <span className="slider-field__value">{value}</span>
        )}
      </div>
      
      <div className="slider-field__container">
        {leftLabel && (
          <span className="slider-field__endpoint slider-field__endpoint--left">
            {leftLabel}
          </span>
        )}
        
        <div className="slider-field__track-wrapper">
          <input
            type="range"
            id={inputId}
            value={value}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            className="slider-field__input"
            style={{
              background: `linear-gradient(to right, #1a365d 0%, #1a365d ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`
            }}
          />
          <div className="slider-field__ticks">
            {Array.from({ length: max - min + 1 }, (_, i) => (
              <div 
                key={i} 
                className={`slider-field__tick ${i + min === value ? 'slider-field__tick--active' : ''}`}
              />
            ))}
          </div>
        </div>
        
        {rightLabel && (
          <span className="slider-field__endpoint slider-field__endpoint--right">
            {rightLabel}
          </span>
        )}
      </div>
      
      {helpText && (
        <span className="slider-field__help">{helpText}</span>
      )}
    </div>
  );
};

export default SliderField;
