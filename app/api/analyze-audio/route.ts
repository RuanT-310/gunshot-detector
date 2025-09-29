import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import { writeFile, unlink } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "Nenhum arquivo de áudio fornecido" }, { status: 400 })
    }

    // Criar um nome único para o arquivo temporário
    const tempFileName = `${uuidv4()}_${audioFile.name}`
    const tempFilePath = path.join(process.cwd(), "temp", tempFileName)

    // Salvar o arquivo temporariamente
    const bytes = await audioFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(tempFilePath, buffer)

    // Executar o script Python
    const pythonProcess = spawn("python", [path.join(process.cwd(), "scripts", "audio_analyzer.py"), tempFilePath])

    let output = ""
    let error = ""

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString()
    })

    pythonProcess.stderr.on("data", (data) => {
      error += data.toString()
    })

    // Aguardar o processo terminar
    await new Promise((resolve, reject) => {
      pythonProcess.on("close", (code) => {
        if (code === 0) {
          resolve(code)
        } else {
          reject(new Error(`Processo Python terminou com código ${code}: ${error}`))
        }
      })
    })

    // Limpar arquivo temporário
    await unlink(tempFilePath)

    // Parsear o resultado do Python
    try {
      const result = JSON.parse(output.trim())
      return NextResponse.json({
        detected: result.gunshot_detected,
        confidence: result.confidence,
        features: result.features,
        filename: audioFile.name,
        timestamp: new Date().toISOString(),
      })
    } catch (parseError) {
      console.error("Erro ao parsear resultado do Python:", parseError)
      return NextResponse.json(
        {
          error: "Erro ao processar resultado da análise",
          details: output,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Erro na análise de áudio:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
