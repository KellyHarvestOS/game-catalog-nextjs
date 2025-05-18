// app/(main)/layout.tsx
import React from 'react';

export default function MainGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <>
   
      {children}
    </>
  );
}