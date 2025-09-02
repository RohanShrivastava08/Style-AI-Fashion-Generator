"use client";

import { Feather, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../theme-toggle";

interface HeaderProps {
  onGetStartedClick: () => void;
}

export default function Header({ onGetStartedClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-3">
          <Feather className="h-8 w-8 text-primary" />
          <p className="text-2xl font-bold tracking-tight">StyleAI</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onGetStartedClick} className="rounded-full shadow-lg">
            <Sparkles className="mr-2 h-5 w-5" />
            Try Now
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
