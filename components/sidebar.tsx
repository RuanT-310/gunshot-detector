"use client"

import { Plus, Clock, FileAudio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { AnalysisResult } from "@/app/page"

interface SidebarProps {
  previousAnalyses: AnalysisResult[]
  onNewAnalysis: () => void
  onSelectAnalysis: (analysis: AnalysisResult) => void
}

export function Sidebar({ previousAnalyses, onNewAnalysis, onSelectAnalysis }: SidebarProps) {
  return (
    <aside className="w-80 bg-sidebar border-r border-sidebar-border">
      <div className="p-4">
        <Button
          onClick={onNewAnalysis}
          className="w-full gap-2 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
        >
          <Plus className="w-4 h-4" />
          Nova Análise
        </Button>
      </div>

      <div className="px-4 pb-4">
        <h3 className="text-sm font-medium text-sidebar-foreground mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Análises Anteriores
        </h3>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          {previousAnalyses.length === 0 ? (
            <div className="text-center py-8">
              <FileAudio className="w-8 h-8 text-sidebar-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-sidebar-foreground/60">Nenhuma análise anterior ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {previousAnalyses.map((analysis) => (
                <button
                  key={analysis.id}
                  onClick={() => onSelectAnalysis(analysis)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors",
                    "hover:bg-sidebar-accent text-sidebar-foreground",
                    "border border-sidebar-border",
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn("w-2 h-2 rounded-full", analysis.detected ? "bg-destructive" : "bg-success")} />
                    <span className="text-sm font-medium truncate">{analysis.filename}</span>
                  </div>
                  <p className="text-xs text-sidebar-foreground/60">{analysis.timestamp.toLocaleString()}</p>
                  <p className="text-xs text-sidebar-foreground/80 mt-1">
                    {analysis.detected ? "Tiro Detectado" : "Nenhum Tiro"}
                    {analysis.confidence && ` (${analysis.confidence.toFixed(1)}%)`}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </aside>
  )
}
