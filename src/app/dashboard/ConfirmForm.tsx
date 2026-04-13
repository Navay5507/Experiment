'use client';

import { ReactNode, useRef } from 'react';

interface ConfirmFormProps {
  message: string;
  action: (formData: FormData) => void;
  children: ReactNode;
}

export default function ConfirmForm({ message, action, children }: ConfirmFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  
  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}
