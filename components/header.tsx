import { Shield, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="h-16 border-b border-border bg-card">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Detector de Tiros IA</h1>
            <p className="text-sm text-muted-foreground">Análise Avançada de Áudio</p>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="gap-2">
          <User className="w-4 h-4" />
          Perfil
        </Button>
      </div>
    </header>
  )
}
