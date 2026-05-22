'use client';

import { ReactNode, useRef } from 'react';

interface ConfirmFormProps {
  message: string;
  promptText?: string;
  action: (formData: FormData) => void;
  children: ReactNode;
}

export default function ConfirmForm({ message, promptText, action, children }: ConfirmFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  
  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={(e) => {
        if (promptText) {
          const input = prompt(message);
          if (input !== promptText) {
            alert(`Incorrect confirmation. You must type "${promptText}" in capitals only to confirm.`);
            e.preventDefault();
          }
        } else {
          if (!confirm(message)) {
            e.preventDefault();
          }
        }
      }}
    >
      {children}
    </form>
  );
}
