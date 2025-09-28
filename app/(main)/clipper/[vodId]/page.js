// app/(main)/clipper/[vodId]/page.js
import { Suspense } from 'react';
import ClippingTool from '@/components/ClippingTool';

export default function ClipperIdPage({ params }) {
  const { vodId } = params;

  return (
    <Suspense fallback={<p style={{textAlign: 'center', padding: '4rem'}}>Loading Clipper...</p>}>
      <ClippingTool vodId={vodId} />
    </Suspense>
  );
}
