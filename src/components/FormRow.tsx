import type { FC, ReactNode } from 'react';

interface FormRowProps {
  label: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}

const FormRow: FC<FormRowProps> = ({ label, hint, children }) => {
  return (
    <div className="grid gap-4 border-b border-[#e4e7ee] py-5 last:border-b-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        {hint ? <p className="mt-0.5 text-xs text-[#5c6170]">{hint}</p> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
};

export default FormRow;
