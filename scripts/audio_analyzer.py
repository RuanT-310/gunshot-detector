import numpy as np
import librosa
import scipy.signal
from scipy.stats import kurtosis, skew
import json
import sys
from pathlib import Path

class GunshotDetector:
    def __init__(self):
        # Características típicas de tiros
        self.gunshot_features = {
            'duration_range': (0.1, 2.0),  # segundos
            'frequency_peak_range': (200, 8000),  # Hz
            'energy_threshold': 0.7,
            'spectral_rolloff_threshold': 0.85
        }
    
    def load_audio(self, file_path, sr=22050):
        """Carrega arquivo de áudio"""
        try:
            audio, sample_rate = librosa.load(file_path, sr=sr)
            return audio, sample_rate
        except Exception as e:
            print(f"[v0] Erro ao carregar áudio: {e}")
            return None, None
    
    def extract_features(self, audio, sr):
        """Extrai características do áudio para análise"""
        features = {}
        
        # Características temporais
        features['duration'] = len(audio) / sr
        features['rms_energy'] = np.sqrt(np.mean(audio**2))
        features['zero_crossing_rate'] = np.mean(librosa.feature.zero_crossing_rate(audio))
        
        # Características espectrais
        stft = librosa.stft(audio)
        magnitude = np.abs(stft)
        
        # Centroide espectral
        features['spectral_centroid'] = np.mean(librosa.feature.spectral_centroid(y=audio, sr=sr))
        
        # Rolloff espectral
        features['spectral_rolloff'] = np.mean(librosa.feature.spectral_rolloff(y=audio, sr=sr))
        
        # Largura de banda espectral
        features['spectral_bandwidth'] = np.mean(librosa.feature.spectral_bandwidth(y=audio, sr=sr))
        
        # MFCC (Mel-frequency cepstral coefficients)
        mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
        features['mfcc_mean'] = np.mean(mfccs, axis=1)
        features['mfcc_std'] = np.std(mfccs, axis=1)
        
        # Características estatísticas
        features['kurtosis'] = kurtosis(audio)
        features['skewness'] = skew(audio)
        
        # Picos de energia
        onset_frames = librosa.onset.onset_detect(y=audio, sr=sr)
        features['onset_count'] = len(onset_frames)
        
        return features
    
    def detect_gunshot_patterns(self, features):
        """Detecta padrões característicos de tiros"""
        score = 0.0
        confidence_factors = []
        
        # Análise de duração
        duration = features['duration']
        if self.gunshot_features['duration_range'][0] <= duration <= self.gunshot_features['duration_range'][1]:
            duration_score = 0.2
            confidence_factors.append("Duração compatível com tiro")
        else:
            duration_score = 0.0
            confidence_factors.append("Duração não típica de tiro")
        
        score += duration_score
        
        # Análise de energia
        energy = features['rms_energy']
        if energy > self.gunshot_features['energy_threshold']:
            energy_score = 0.25
            confidence_factors.append("Alta energia detectada")
        else:
            energy_score = 0.1
            confidence_factors.append("Energia baixa")
        
        score += energy_score
        
        # Análise espectral
        centroid = features['spectral_centroid']
        if self.gunshot_features['frequency_peak_range'][0] <= centroid <= self.gunshot_features['frequency_peak_range'][1]:
            spectral_score = 0.2
            confidence_factors.append("Frequência central compatível")
        else:
            spectral_score = 0.05
            confidence_factors.append("Frequência central atípica")
        
        score += spectral_score
        
        # Análise de rolloff espectral
        rolloff = features['spectral_rolloff']
        if rolloff > self.gunshot_features['spectral_rolloff_threshold'] * features['spectral_centroid']:
            rolloff_score = 0.15
            confidence_factors.append("Distribuição espectral típica de impacto")
        else:
            rolloff_score = 0.05
            confidence_factors.append("Distribuição espectral não típica")
        
        score += rolloff_score
        
        # Análise de onset (início súbito)
        onset_count = features['onset_count']
        if onset_count >= 1:
            onset_score = 0.2
            confidence_factors.append("Início súbito detectado")
        else:
            onset_score = 0.0
            confidence_factors.append("Sem início súbito claro")
        
        score += onset_score
        
        return min(score, 1.0), confidence_factors
    
    def analyze_audio_file(self, file_path):
        """Análise completa de um arquivo de áudio"""
        print(f"[v0] Iniciando análise do arquivo: {file_path}")
        
        # Carrega o áudio
        audio, sr = self.load_audio(file_path)
        if audio is None:
            return {
                'error': 'Não foi possível carregar o arquivo de áudio',
                'is_gunshot': False,
                'confidence': 0.0
            }
        
        print(f"[v0] Áudio carregado: {len(audio)} samples, {sr} Hz")
        
        # Extrai características
        features = self.extract_features(audio, sr)
        print(f"[v0] Características extraídas: {len(features)} features")
        
        # Detecta padrões de tiro
        confidence, factors = self.detect_gunshot_patterns(features)
        is_gunshot = confidence > 0.6  # Threshold para classificação
        
        print(f"[v0] Análise concluída: {'TIRO' if is_gunshot else 'NÃO É TIRO'} (confiança: {confidence:.2f})")
        
        return {
            'is_gunshot': is_gunshot,
            'confidence': confidence,
            'confidence_factors': factors,
            'audio_features': {
                'duration': features['duration'],
                'energy': features['rms_energy'],
                'spectral_centroid': features['spectral_centroid'],
                'onset_count': features['onset_count']
            },
            'file_info': {
                'sample_rate': sr,
                'samples': len(audio),
                'duration_seconds': len(audio) / sr
            }
        }

def main():
    if len(sys.argv) != 2:
        result = {
            'error': 'Uso incorreto. Forneça o caminho do arquivo de áudio.',
            'is_gunshot': False,
            'confidence': 0.0
        }
        print(json.dumps(result))
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if not Path(file_path).exists():
        result = {
            'error': f'Arquivo não encontrado: {file_path}',
            'is_gunshot': False,
            'confidence': 0.0
        }
        print(json.dumps(result))
        sys.exit(1)
    
    try:
        detector = GunshotDetector()
        result = detector.analyze_audio_file(file_path)
        
        output = {
            'gunshot_detected': result['is_gunshot'],
            'confidence': result['confidence'],
            'features': result.get('audio_features', {}),
            'confidence_factors': result.get('confidence_factors', []),
            'file_info': result.get('file_info', {})
        }
        
        print(json.dumps(output))
        
    except Exception as e:
        error_result = {
            'error': f'Erro durante análise: {str(e)}',
            'gunshot_detected': False,
            'confidence': 0.0
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
