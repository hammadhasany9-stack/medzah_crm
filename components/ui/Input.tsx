import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function Input({ icon, className, ...props }: InputProps) {
  if (icon) {
    return (
      <div className="relative flex items-center">
        <span className="absolute left-3 text-slate-400 pointer-events-none">{icon}</span>
        <input
          className={cn(
            "w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-[#002f93] focus:ring-offset-1 focus:border-transparent",
            "transition-shadow duration-150",
            className
          )}
          {...props}
        />
      </div>
    );
  }

  return (
    <input
      className={cn(
        "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-[#002f93] focus:ring-offset-1 focus:border-transparent",
        "transition-shadow duration-150",
        className
      )}
      {...props}
    />
  );
}
