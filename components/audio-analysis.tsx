"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface AudioAnalysisProps {
  audioFile: File
  onStartAnalysis: () => void
  isAnalyzing?: boolean
}

export function AudioAnalysis({ audioFile, onStartAnalysis, isAnalyzing = false }: AudioAnalysisProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string>("")

  useEffect(() => {
    const url = URL.createObjectURL(audioFile)
    setAudioUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [audioFile])

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
          <h2 className="text-2xl font-bold text-foreground mb-2">Áudio Pronto para Análise</h2>
          <p className="text-muted-foreground">Revise seu arquivo de áudio e inicie a análise de detecção de tiros</p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-1">{audioFile.name}</h3>
              <p className="text-sm text-muted-foreground">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>

            <div className="space-y-4">
              <audio
                ref={audioRef}
                src={audioUrl}
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

            <div className="flex gap-3 justify-center">
              <Button onClick={onStartAnalysis} disabled={isAnalyzing} className="gap-2 px-8">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analisando Áudio...
                  </>
                ) : (
                  /* traduzindo botão de analisar áudio */
                  "Analisar Áudio"
                )}
              </Button>
            </div>

            {isAnalyzing && (
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processando áudio com modelos de IA...</span>
                </div>
                <Progress value={33} className="h-1" />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
