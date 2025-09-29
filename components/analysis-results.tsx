"use client"

import { useRef, useState } from "react"
import { AlertTriangle, CheckCircle, Play, Pause, Plus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { AnalysisResult } from "@/app/page"

interface AnalysisResultsProps {
  result: AnalysisResult
  onNewAnalysis: () => void
}

export function AnalysisResults({ result, onNewAnalysis }: AnalysisResultsProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Análise Concluída</h2>
          <p className="text-muted-foreground">Resultados da análise de IA para seu arquivo de áudio</p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            {result.error ? (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-warning" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-warning">Erro na Análise</h3>
                  <p className="text-sm text-muted-foreground mb-4">{result.error}</p>
                  <div className="bg-muted/50 p-4 rounded-lg text-left">
                    <h4 className="font-semibold mb-2">Para configurar o backend Python:</h4>
                    <ol className="text-sm space-y-1 list-decimal list-inside">
                      <li>
                        Instale as dependências:{" "}
                        <code className="bg-background px-1 rounded">pip install librosa numpy scipy scikit-learn</code>
                      </li>
                      <li>
                        Crie a pasta <code className="bg-background px-1 rounded">temp</code> na raiz do projeto
                      </li>
                      <li>Certifique-se que o Python está no PATH do sistema</li>
                    </ol>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto">
                  {result.detected ? (
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-destructive" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-success" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className={`text-2xl font-bold mb-2 ${result.detected ? "text-destructive" : "text-success"}`}>
                    {result.detected ? "Tiro Detectado!" : "Nenhum Tiro Detectado"}
                  </h3>

                  {result.confidence && (
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant={result.detected ? "destructive" : "default"}>
                        Confiança: {result.confidence.toFixed(1)}%
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-semibold text-foreground mb-1">{result.filename}</h4>
                <p className="text-sm text-muted-foreground">Analisado em {result.timestamp.toLocaleString()}</p>
              </div>

              {result.audioUrl && (
                <div className="space-y-4">
                  <audio
                    ref={audioRef}
                    src={result.audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />

                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={togglePlayback} className="gap-2 bg-transparent">
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isPlaying ? "Pausar" : "Reproduzir"}
                    </Button>

                    <div className="flex-1 space-y-2">
                      <Progress value={duration > 0 ? (currentTime / duration) * 100 : 0} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={onNewAnalysis} className="gap-2 px-8">
                <Plus className="w-4 h-4" />
                Iniciar Nova Análise
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
