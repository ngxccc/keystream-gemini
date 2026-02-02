import { Button } from "@/components/ui/button";

interface HeaderProps {
  isConnected: boolean;
}

export function Header({ isConnected }: HeaderProps) {
  return (
    <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          <span className="animate-bounce">✨</span>
          <span className="bg-linear-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            KeyStream Gemini
          </span>
        </h2>
        <div className="mt-2 flex items-center gap-2">
          <div
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${
              isConnected
                ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                : "border-rose-200 bg-rose-100 text-rose-700"
            }`}
          >
            <span
              className={`mr-1.5 h-2 w-2 rounded-full ${
                isConnected ? "animate-pulse bg-emerald-500" : "bg-rose-500"
              }`}
            ></span>
            {isConnected ? "SYSTEM ONLINE" : "DISCONNECTED"}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="shadow-sm">
          Config
        </Button>
        <Button variant="outline" className="shadow-sm">
          Theme
        </Button>
      </div>
    </header>
  );
}
