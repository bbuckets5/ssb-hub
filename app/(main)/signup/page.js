// app/(main)/signup/page.js

import { Suspense } from 'react';
import SignupForm from '@/components/SignupForm';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="auth-container"><p>Loading form...</p></div>}>
      <SignupForm />
    </Suspense>
  );
}
