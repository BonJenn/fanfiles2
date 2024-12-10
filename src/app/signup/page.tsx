'use client';

import { SearchWrapper } from '@/components/common/SearchWrapper';
import { SignupContent } from '@/components/auth/SignupContent';
import { Spinner } from '@/components/common/Spinner';

export default function SignupPage() {
  return (
    <SearchWrapper>
      <SignupContent />
    </SearchWrapper>
  );
}

