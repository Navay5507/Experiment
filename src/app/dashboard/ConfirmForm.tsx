'use client';

import { ReactNode, useRef, useState } from 'react';

interface ConfirmFormProps {
  message: string;
  promptText?: string;
  action: (formData: FormData) => void;
  children: ReactNode;
}

export default function ConfirmForm({ message, promptText, action, children }: ConfirmFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);
  
  return (
    <form
      ref={formRef}
      action={async (formData) => {
        setIsPending(true);
        try {
          await action(formData);
        } finally {
          setIsPending(false);
        }
      }}
      style={{ opacity: isPending ? 0.5 : 1, pointerEvents: isPending ? 'none' : 'auto' }}
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
