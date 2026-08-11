import type React from "react";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { DemoAlert } from "@/components/demo-alert";
import { SidebarProvider } from "@/components/ui/sidebar";
import { isDemoMode } from "@/constants/urls";
import { useUserPreferencesEffects } from "@/hooks/use-user-preferences-effects";
import { cn } from "@/lib/cn";
import { useUserPreferencesStore } from "@/store/user-preferences";

type LayoutProps = {
  children: ReactNode;
  className?: string;
};

type HeaderProps = {
  children: ReactNode;
  className?: string;
};

type ContentProps = {
  children: ReactNode;
  className?: string;
};

function LayoutHeader({ children, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "flex h-10 shrink-0 items-center gap-2 border-b border-border bg-container px-3 transition-[width,height] ease-in-out group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-8",
        className,
      )}
    >
      {children}
    </header>
  );
}

function LayoutContent({ children, className }: ContentProps) {
  return (
    <div className={cn("min-h-0 flex-1", className)}>
      <div className="h-full">{children}</div>
    </div>
  );
}

function Layout({ children, className }: LayoutProps) {
  const { sidebarDefaultOpen } = useUserPreferencesStore();

  useUserPreferencesEffects();

  return (
    <div className="flex h-svh w-full overflow-hidden bg-sidebar">
      <SidebarProvider
        defaultOpen={sidebarDefaultOpen}
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 60)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <div className="flex h-svh w-full min-w-0 flex-1 flex-col overflow-hidden md:p-2">
          <div
            className={cn(
              "flex h-full w-full flex-col overflow-hidden bg-container md:rounded-md md:border md:border-border",
              className,
            )}
          >
            {isDemoMode && <DemoAlert />}
            {children}
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}

Layout.Header = LayoutHeader;
Layout.Content = LayoutContent;

export default Layout;
