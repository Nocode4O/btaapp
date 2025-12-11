import { Shield, Link2 } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">ChainSign AI</h1>
              <p className="text-xs text-muted-foreground">Blockchain Traced Detection</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-success">Chain Verified</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Link2 className="w-4 h-4" />
              <span className="text-sm font-mono">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
