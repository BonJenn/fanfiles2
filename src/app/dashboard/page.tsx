'use client';

import { SearchWrapper } from '@/components/common/SearchWrapper';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { Spinner } from '@/components/common/Spinner';

export default function DashboardPage() {
  return (
    <SearchWrapper>
      <DashboardContent />
    </SearchWrapper>
  );
}

