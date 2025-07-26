
import * as React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={
          "border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm " +
          className
        }
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
