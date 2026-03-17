"use client";

import { HeroUIProvider } from "@heroui/react";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <HeroUIProvider className="flex flex-col flex-grow min-h-full">
        {children}
      </HeroUIProvider>
    </SessionProvider>
  );
}
