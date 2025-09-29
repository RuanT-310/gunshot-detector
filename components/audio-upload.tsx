"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileAudio, Zap, Shield } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AudioUploadProps {
  onAudioUpload: (file: File) => void
}

export function AudioUpload({ onAudioUpload }: AudioUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onAudioUpload(acceptedFiles[0])
      }
    },
    [onAudioUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac"],
    },
    multiple: false,
  })

  return (
    <div className="flex items-center justify-center h-full">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Detecção de Tiros por Áudio</h2>
            <p className="text-lg text-muted-foreground">
              Envie um arquivo de áudio para detectar sons de tiros usando análise avançada de IA
            </p>
          </div>
        </div>

        <Card className="p-8">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
              ${
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto">
                {isDragActive ? (
                  <Upload className="w-6 h-6 text-primary" />
                ) : (
                  <FileAudio className="w-6 h-6 text-muted-foreground" />
                )}
              </div>

              <div>
                <p className="text-lg font-medium text-foreground mb-1">
                  {isDragActive ? "Solte seu arquivo de áudio aqui" : "Enviar Arquivo de Áudio"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Arraste e solte ou clique para selecionar • MP3, WAV, M4A, AAC, OGG, FLAC
                </p>
              </div>

              <Button variant="outline" className="gap-2 bg-transparent">
                <Upload className="w-4 h-4" />
                Escolher Arquivo
              </Button>
            </div>
          </div>
        </Card>


      </div>
    </div>
  )
}
