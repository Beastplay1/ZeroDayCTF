"use client";

import { HeroUIProvider } from "@heroui/react";
import { I18nProvider } from "@/lib/i18n/context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider className="flex flex-col flex-grow min-h-full">
      <I18nProvider>
        {children}
      </I18nProvider>
    </HeroUIProvider>
  );
}
