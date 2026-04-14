"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";

  return (
    <main style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #1a1a2e 0%, #000 100%)'
    }}>
      <SignIn
        appearance={{
          layout: { logoPlacement: 'inside', logoImageUrl: '/autodrop_icon_transparent.png' },
          elements: { formButtonPrimary: { backgroundColor: '#8b5cf6', '&:hover': { backgroundColor: '#7c3aed' } } }
        }}
        routing="path"
        path="/sign-in"
        forceRedirectUrl={redirectUrl}
      />
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#000' }} />}>
      <SignInContent />
    </Suspense>
  );
}
