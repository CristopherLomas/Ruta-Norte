"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { logoutAction } from "@/features/auth/actions";
import { authService } from "@/features/auth/services/authService";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  showText?: boolean;
}

export function LogoutButton({
  className,
  variant = "outline",
  showText = true,
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      authService.logout();
      await logoutAction();
      router.push("/login");
      router.refresh();
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      {showText && <span className="ml-2">Cerrar Sesión</span>}
    </Button>
  );
}
