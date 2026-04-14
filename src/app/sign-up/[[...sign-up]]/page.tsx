"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignUpContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  return (
    <main style={{ 
       display: 'flex', 
       justifyContent: 'center', 
       alignItems: 'center', 
       minHeight: '100vh', 
       background: 'radial-gradient(circle at center, #1a1a2e 0%, #000 100%)' 
    }}>
      <SignUp 
         appearance={{ 
            layout: { logoPlacement: 'inside', logoImageUrl: '/autodrop_icon_transparent.png' },
            elements: { formButtonPrimary: { backgroundColor: '#8b5cf6', '&:hover': { backgroundColor: '#7c3aed' } } } 
         }} 
         routing="path" 
         path="/sign-up"
         forceRedirectUrl="/"
         unsafeMetadata={ref ? { referral_code: ref } : undefined}
      />
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'radial-gradient(circle at center, #1a1a2e 0%, #000 100%)' }}>
        <div style={{ color: '#fff' }}>Loading...</div>
      </main>
    }>
      <SignUpContent />
    </Suspense>
  );
}
