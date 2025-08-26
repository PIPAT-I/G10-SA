import { type ReactNode } from 'react';

interface MinimalLayoutProps {
  children: ReactNode;
}

export default function MinimalLayout({ children }: MinimalLayoutProps) {
  return (
    <div style={{ fontFamily: 'Kanit' }}>
      {children}
    </div>
  );
}