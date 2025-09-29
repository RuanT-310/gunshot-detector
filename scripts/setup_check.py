#!/usr/bin/env python3
"""
Script para verificar se todas as dependências estão instaladas corretamente
"""

import sys
import importlib
import subprocess

def check_python_version():
    """Verifica a versão do Python"""
    version = sys.version_info
    print(f"Python {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ é necessário")
        return False
    else:
        print("✅ Versão do Python OK")
        return True

def check_dependencies():
    """Verifica se todas as dependências estão instaladas"""
    dependencies = [
        'numpy',
        'librosa', 
        'scipy',
        'sklearn',
        'matplotlib',
        'soundfile'
    ]
    
    missing = []
    
    for dep in dependencies:
        try:
            importlib.import_module(dep)
            print(f"✅ {dep}")
        except ImportError:
            print(f"❌ {dep} - não instalado")
            missing.append(dep)
    
    return missing

def main():
    print("🔍 Verificando configuração do backend Python...\n")
    
    # Verificar versão do Python
    python_ok = check_python_version()
    print()
    
    # Verificar dependências
    print("📦 Verificando dependências:")
    missing = check_dependencies()
    print()
    
    if not python_ok:
        print("❌ Atualize o Python para versão 3.8+")
        return 1
    
    if missing:
        print("❌ Dependências faltando. Instale com:")
        print(f"pip install {' '.join(missing)}")
        return 1
    
    print("✅ Todas as verificações passaram!")
    print("🚀 O backend Python está pronto para uso!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
