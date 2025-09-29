import os
import json
from pathlib import Path
from audio_analyzer import GunshotDetector
import time

def analyze_directory(directory_path, output_file=None):
    """Analisa todos os arquivos de áudio em um diretório"""
    detector = GunshotDetector()
    results = []
    
    # Extensões de áudio suportadas
    audio_extensions = {'.wav', '.mp3', '.flac', '.m4a', '.ogg'}
    
    directory = Path(directory_path)
    if not directory.exists():
        print(f"Erro: Diretório não encontrado: {directory_path}")
        return
    
    # Encontra todos os arquivos de áudio
    audio_files = []
    for ext in audio_extensions:
        audio_files.extend(directory.glob(f"*{ext}"))
        audio_files.extend(directory.glob(f"**/*{ext}"))
    
    if not audio_files:
        print("Nenhum arquivo de áudio encontrado no diretório.")
        return
    
    print(f"[v0] Encontrados {len(audio_files)} arquivos de áudio")
    
    # Analisa cada arquivo
    for i, file_path in enumerate(audio_files, 1):
        print(f"\n[v0] Analisando {i}/{len(audio_files)}: {file_path.name}")
        
        start_time = time.time()
        result = detector.analyze_audio_file(str(file_path))
        analysis_time = time.time() - start_time
        
        result['file_path'] = str(file_path)
        result['file_name'] = file_path.name
        result['analysis_time_seconds'] = round(analysis_time, 2)
        
        results.append(result)
        
        # Mostra resultado resumido
        status = "TIRO" if result['is_gunshot'] else "NORMAL"
        confidence = result['confidence']
        print(f"    Resultado: {status} (confiança: {confidence:.2f}) - {analysis_time:.2f}s")
    
    # Salva resultados
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"\n[v0] Resultados salvos em: {output_file}")
    
    # Estatísticas finais
    gunshots_detected = sum(1 for r in results if r['is_gunshot'])
    total_files = len(results)
    
    print(f"\n[v0] RESUMO DA ANÁLISE:")
    print(f"    Total de arquivos: {total_files}")
    print(f"    Tiros detectados: {gunshots_detected}")
    print(f"    Taxa de detecção: {gunshots_detected/total_files*100:.1f}%")
    
    return results

def main():
    import sys
    
    if len(sys.argv) < 2:
        print("Uso: python batch_analyzer.py <diretório> [arquivo_saída.json]")
        sys.exit(1)
    
    directory_path = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else "analysis_results.json"
    
    analyze_directory(directory_path, output_file)

if __name__ == "__main__":
    main()
