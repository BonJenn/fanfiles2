'use client';

import { ReactNode } from 'react';

interface SearchWrapperProps {
  children: ReactNode;
}

export function SearchWrapper({ children }: SearchWrapperProps) {
  return children;
}