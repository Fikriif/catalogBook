'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { TopNavbar } from '@/components/dashboard/TopNavbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50/70 dark:bg-zinc-950 flex flex-col font-sans">
      <div className="flex flex-1">
        {/* Sidebar */}
        <AppSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {/* Main Body */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar onOpenMobileSidebar={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

