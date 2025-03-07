'use client';

import { ThemeProvider } from "next-themes";
import { ShortcutsProvider } from "@/contexts/ShortcutsContext";
import { ConvexClientProvider } from '@/components/ConvexClientProvider';

// Add any other providers your app uses here
// import { OtherProvider } from "other-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexClientProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ShortcutsProvider>
          {children}
        </ShortcutsProvider>
      </ThemeProvider>
    </ConvexClientProvider>
  );
}
