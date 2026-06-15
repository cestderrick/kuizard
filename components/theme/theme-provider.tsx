"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Wrapper next-themes pour gérer le dark mode.
 * - attribute="class" → next-themes pose la classe `.dark` sur <html>
 * - defaultTheme="system" → respecte la préférence OS au premier visit
 * - enableSystem → bascule auto si l'utilisateur change sa préférence OS
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
