"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

const SelectField = forwardRef<HTMLDivElement, SelectFieldProps>(
  (
    {
      label,
      name,
      value,
      onChange,
      options,
      placeholder,
      required,
      disabled,
      error,
      className,
    },
    ref
  ) => {
    return (
      <div className={cn("w-full space-y-2", className)} ref={ref}>
        {label && (
          <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <Select
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          name={name}
        >
          <SelectTrigger
            id={name}
            className={cn(
              error ? "border-red-500 focus:ring-red-500" : "",
              "w-full"
            )}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
          >
            <SelectValue placeholder={placeholder || "選択してください"} />
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
          <p
            id={`${name}-error`}
            className="mt-1 text-sm text-red-500"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

SelectField.displayName = "SelectField";

export { SelectField };
