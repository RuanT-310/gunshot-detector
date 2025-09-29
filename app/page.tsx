"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { AudioUpload } from "@/components/audio-upload"
import { AudioAnalysis } from "@/components/audio-analysis"
import { AnalysisResults } from "@/components/analysis-results"

export type AnalysisState = "idle" | "analyzing" | "complete"

export interface AnalysisResult {
  id: string
  filename: string
  timestamp: Date
  detected: boolean
  confidence?: number
  audioUrl?: string
  features?: any
  error?: string
}

export default function Home() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle")
  const [currentAudio, setCurrentAudio] = useState<File | null>(null)
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null)
  const [previousAnalyses, setPreviousAnalyses] = useState<AnalysisResult[]>([])

  const handleAudioUpload = (file: File) => {
    setCurrentAudio(file)
    setAnalysisState("idle")
    setCurrentResult(null)
  }

  const handleStartAnalysis = async () => {
    if (!currentAudio) return

    setAnalysisState("analyzing")

    try {
      const formData = new FormData()
      formData.append("audio", currentAudio)

      const response = await fetch("/api/analyze-audio", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Erro na análise do áudio")
      }

      const analysisData = await response.json()

      const result: AnalysisResult = {
        id: Date.now().toString(),
        filename: currentAudio.name,
        timestamp: new Date(),
        detected: analysisData.detected || analysisData.is_gunshot,
        confidence: analysisData.confidence * 100, // Converter para porcentagem
        audioUrl: URL.createObjectURL(currentAudio),
        features: analysisData.features,
      }

      setCurrentResult(result)
      setPreviousAnalyses((prev) => [result, ...prev])
      setAnalysisState("complete")
    } catch (error) {
      console.error("Erro na análise:", error)
      // Fallback para simulação em caso de erro
      const result: AnalysisResult = {
        id: Date.now().toString(),
        filename: currentAudio.name,
        timestamp: new Date(),
        detected: false,
        confidence: 0,
        audioUrl: URL.createObjectURL(currentAudio),
        error: "Erro na análise do áudio. Verifique se o Python está configurado corretamente.",
      }
      setCurrentResult(result)
      setAnalysisState("complete")
    }
  }

  const handleNewAnalysis = () => {
    setAnalysisState("idle")
    setCurrentAudio(null)
    setCurrentResult(null)
  }

  const handleSelectPreviousAnalysis = (analysis: AnalysisResult) => {
    setCurrentResult(analysis)
    setAnalysisState("complete")
    setCurrentAudio(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar
          previousAnalyses={previousAnalyses}
          onNewAnalysis={handleNewAnalysis}
          onSelectAnalysis={handleSelectPreviousAnalysis}
        />

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto h-full">
            {analysisState === "idle" && !currentAudio && <AudioUpload onAudioUpload={handleAudioUpload} />}

            {analysisState === "idle" && currentAudio && (
              <AudioAnalysis audioFile={currentAudio} onStartAnalysis={handleStartAnalysis} />
            )}

            {analysisState === "analyzing" && (
              <AudioAnalysis audioFile={currentAudio!} onStartAnalysis={handleStartAnalysis} isAnalyzing={true} />
            )}

            {analysisState === "complete" && currentResult && (
              <AnalysisResults result={currentResult} onNewAnalysis={handleNewAnalysis} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
