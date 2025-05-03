import React from "react";

function Button({ className, children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}

export { Button }; 