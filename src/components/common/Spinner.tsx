'use client';

export function Spinner({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} border-4 border-black border-t-transparent rounded-full animate-spin`} />
  );
}
