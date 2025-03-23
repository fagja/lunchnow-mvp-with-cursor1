import React, { forwardRef } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ className, label, error, helperText, onBlur, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <Input
          className={cn(
            error ? "border-red-500 focus:ring-red-500" : "",
            className
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
          }
          onBlur={onBlur}
          {...props}
        />
        {error && (
          <p
            id={`${props.id}-error`}
            className="mt-1 text-sm text-red-500"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${props.id}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";

export { TextField };
