'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Label } from './Label';

interface CustomSelectProps {
  label?: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  defaultValue?: string;
  disabled?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  ref?: React.Ref<HTMLSelectElement>;
}

export const CustomSelect: React.FC<CustomSelectProps> = React.forwardRef<
  HTMLSelectElement,
  CustomSelectProps
>(({
  label,
  options,
  error,
  defaultValue,
  disabled,
  value,
  onValueChange,
  name,
  onChange,
  onBlur,
  ...props
}, ref) => {
  const handleValueChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    }
    if (onChange) {
      // Create a synthetic event for react-hook-form compatibility
      const syntheticEvent = {
        target: { value: newValue, name: name || '' },
        currentTarget: { value: newValue, name: name || '' }
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
        defaultValue={defaultValue}
      >
        <SelectTrigger className={error ? 'border-error' : ''}>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
});

export default CustomSelect;
