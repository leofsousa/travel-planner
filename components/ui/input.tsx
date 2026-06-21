import { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label> {label}</label>}
      <input
        {...props}
        className={`border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
      />
    </div>
  );
}
