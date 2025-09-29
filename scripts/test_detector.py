import numpy as np
import librosa
from audio_analyzer import GunshotDetector
import json

def generate_test_audio():
    """Gera áudios de teste para validar o detector"""
    sr = 22050
    
    # Simula um tiro: impulso curto com alta energia
    gunshot_duration = 0.5
    t = np.linspace(0, gunshot_duration, int(sr * gunshot_duration))
    
    # Envelope exponencial decrescente (típico de tiros)
    envelope = np.exp(-t * 10)
    
    # Ruído branco filtrado para simular o espectro de um tiro
    noise = np.random.normal(0, 1, len(t))
    
    # Filtro passa-alta para enfatizar frequências médias-altas
    from scipy.signal import butter, filtfilt
    b, a = butter(4, 1000 / (sr/2), btype='high')
    filtered_noise = filtfilt(b, a, noise)
    
    gunshot_audio = envelope * filtered_noise * 0.8
    
    # Simula ruído ambiente: som contínuo de baixa energia
    ambient_duration = 2.0
    t_ambient = np.linspace(0, ambient_duration, int(sr * ambient_duration))
    ambient_audio = np.random.normal(0, 0.1, len(t_ambient))
    
    return gunshot_audio, ambient_audio, sr

def test_detector():
    """Testa o detector com áudios simulados"""
    print("[v0] Gerando áudios de teste...")
    
    gunshot_audio, ambient_audio, sr = generate_test_audio()
    detector = GunshotDetector()
    
    # Salva áudios temporários para teste
    import soundfile as sf
    sf.write('test_gunshot.wav', gunshot_audio, sr)
    sf.write('test_ambient.wav', ambient_audio, sr)
    
    print("\n[v0] Testando detecção de tiro simulado...")
    result_gunshot = detector.analyze_audio_file('test_gunshot.wav')
    print(f"Resultado: {'✓ TIRO DETECTADO' if result_gunshot['is_gunshot'] else '✗ NÃO DETECTADO'}")
    print(f"Confiança: {result_gunshot['confidence']:.2f}")
    
    print("\n[v0] Testando ruído ambiente...")
    result_ambient = detector.analyze_audio_file('test_ambient.wav')
    print(f"Resultado: {'✗ FALSO POSITIVO' if result_ambient['is_gunshot'] else '✓ CORRETAMENTE REJEITADO'}")
    print(f"Confiança: {result_ambient['confidence']:.2f}")
    
    # Remove arquivos temporários
    import os
    os.remove('test_gunshot.wav')
    os.remove('test_ambient.wav')
    
    print("\n[v0] Teste concluído!")

if __name__ == "__main__":
    test_detector()
