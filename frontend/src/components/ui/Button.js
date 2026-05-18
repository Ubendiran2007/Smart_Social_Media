import React from "react";
import { cn } from "../../utils/cn";

const variants = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500",
  secondary:
    "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 focus-visible:ring-primary-500",
  ghost:
    "bg-transparent text-gray-900 hover:bg-gray-100 focus-visible:ring-primary-500",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

const sizes = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-11 px-5 text-base rounded-xl",
};

export default function Button({
  as: Comp = "button",
  variant = "primary",
  size = "md",
  className,
  disabled,
  children,
  ...props
}) {
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </Comp>
  );
}

