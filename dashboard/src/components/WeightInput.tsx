import React, { useState } from 'react';
import { Weight } from 'lucide-react';

interface WeightInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const WeightInput: React.FC<WeightInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Voer gewicht in" 
}) => {
  const [displayValue, setDisplayValue] = useState(() => {
    // Extract number from existing value if it contains "kg"
    if (value.includes('kg')) {
      return value.replace(/[^\d.,]/g, '');
    }
    return value.replace(/[^\d.,]/g, '');
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Only allow numbers, dots, and commas
    inputValue = inputValue.replace(/[^\d.,]/g, '');
    
    // Prevent multiple decimal separators
    const parts = inputValue.split(/[.,]/);
    if (parts.length > 2) {
      inputValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Update display value
    setDisplayValue(inputValue);
    
    // Update parent with formatted value (always include kg if there's a number)
    if (inputValue && inputValue !== '') {
      onChange(`${inputValue} kg`);
    } else {
      onChange('');
    }
  };

  const handleBlur = () => {
    // Clean up the display value on blur
    if (displayValue) {
      const cleanValue = parseFloat(displayValue.replace(',', '.'));
      if (!isNaN(cleanValue)) {
        setDisplayValue(cleanValue.toString());
      }
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Weight size={20} className="text-gray-400" />
      </div>
      <input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full bg-indigo-800 border border-indigo-700 text-white pl-12 pr-16 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 placeholder-gray-500 transition-all duration-300 ease-in-out shadow-sm hover:border-indigo-600"
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span className="text-gray-400 text-sm font-medium">kg</span>
      </div>
    </div>
  );
};

export default WeightInput;