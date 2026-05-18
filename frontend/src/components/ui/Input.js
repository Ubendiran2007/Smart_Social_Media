import React from "react";
import { cn } from "../../utils/cn";

export default function Input({
  label,
  hint,
  error,
  className,
  inputClassName,
  id,
  ...props
}) {
  const inputId = id || props.name;
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-800"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900",
          "placeholder:text-gray-400",
          "border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition",
          error && "border-red-300 focus:border-red-500 focus:ring-red-100",
          inputClassName
        )}
        {...props}
      />
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

