import { Settings, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DashboardHeader = ({
  onOpenConfig,
}: {
  onOpenConfig: () => void;
}) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-border pb-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="text-primary animate-pulse">✨</span>
          KeyStream-Gemini
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          High-Performance API Orchestration Layer
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Language & Theme Groups */}
        <div className="flex items-center bg-secondary/50 rounded-lg p-1 border border-border">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            🇺🇸
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            🇻🇳
          </Button>
        </div>

        <div className="flex items-center bg-secondary/50 rounded-lg p-1 border border-border">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Sun className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Moon className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Monitor className="w-4 h-4" />
          </Button>
        </div>

        <Button onClick={onOpenConfig} className="gap-2 ml-2">
          <Settings className="w-4 h-4" /> Config
        </Button>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-200 rounded-md ml-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold">ONLINE</span>
        </div>
      </div>
    </header>
  );
};
