import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
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
            layout: { logoPlacement: 'none' },
            elements: { formButtonPrimary: { backgroundColor: '#8b5cf6', '&:hover': { backgroundColor: '#7c3aed' } } } 
         }} 
         routing="path" 
         path="/sign-in" 
      />
    </main>
  );
}
