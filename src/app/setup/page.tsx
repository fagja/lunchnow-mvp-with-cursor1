'use client';

import { Suspense } from 'react';
import { SetupPageContent } from '@/components/setup/setup-page-content';
import { PageContainer } from '@/components/layout/page-container';

export default function SetupPage() {
  return (
    <Suspense fallback={
      <PageContainer>
        <div className="w-full max-w-md mx-auto py-8 text-center">
          <p>読み込み中...</p>
        </div>
      </PageContainer>
    }>
      <SetupPageContent />
    </Suspense>
  );
}
