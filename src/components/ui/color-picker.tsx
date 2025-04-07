import React from "react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({
  color,
  onChange,
  className,
  ...props
}: ColorPickerProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "type" | "value">) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <div
        className="absolute inset-0 rounded-md overflow-hidden border border-gray-400"
        style={{ backgroundColor: color }}
      />
      <div className="absolute inset-0 rounded-md overflow-hidden bg-gradient-to-br from-white/20 to-black/10 pointer-events-none" />
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
        {...props}
      />
    </div>
  );
} 