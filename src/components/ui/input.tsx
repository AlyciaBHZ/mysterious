import * as React from "react";

import { cn } from "./utils";

const GOLD = "#d4af37";

function Input({ className, type, style, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base transition-all outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      style={{
        backgroundColor: 'rgba(23,23,23,0.6)',
        borderColor: `${GOLD}33`,
        color: '#f5f5f5',
        ...style,
      }}
      {...props}
    />
  );
}

export { Input };
