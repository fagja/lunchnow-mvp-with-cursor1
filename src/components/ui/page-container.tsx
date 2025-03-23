"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

/**
 * ページ全体のコンテナコンポーネント
 * すべてのページを包むレイアウトコンポーネント
 */
export function PageContainer({
  children,
  className,
  fullWidth = false
}: PageContainerProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className={cn(
        "flex-1 w-full mx-auto px-4 py-6 sm:px-6 md:px-8",
        !fullWidth && "max-w-screen-lg",
        className
      )}>
        {children}
      </main>
    </div>
  );
}
