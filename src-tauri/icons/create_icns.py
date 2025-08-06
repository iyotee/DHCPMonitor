#!/usr/bin/env python3
"""
Script pour créer l'icône .icns pour macOS
Utilise les icônes PNG existantes pour créer un fichier .icns
"""

import os
import struct
import tempfile
import shutil
from PIL import Image

def create_icns():
    """Crée l'icône .icns pour macOS"""
    
    try:
        # Créer un dossier temporaire pour l'icône
        with tempfile.TemporaryDirectory() as temp_dir:
            iconset_dir = os.path.join(temp_dir, "icon.iconset")
            os.makedirs(iconset_dir)
            
            # Définir les tailles d'icônes requises pour macOS
            icon_sizes = [
                ("32x32.png", "icon_16x16.png", 16),
                ("32x32.png", "icon_16x16@2x.png", 32),
                ("128x128.png", "icon_32x32.png", 32),
                ("128x128.png", "icon_32x32@2x.png", 64),
                ("128x128.png", "icon_128x128.png", 128),
                ("128x128@2x.png", "icon_128x128@2x.png", 256),
                ("128x128@2x.png", "icon_256x256.png", 256),
                ("128x128@2x.png", "icon_256x256@2x.png", 512),
                ("128x128@2x.png", "icon_512x512.png", 512),
                ("128x128@2x.png", "icon_512x512@2x.png", 1024)
            ]
            
            # Créer les icônes redimensionnées
            for source, target, size in icon_sizes:
                source_path = source  # Utiliser le nom de fichier directement
                target_path = os.path.join(iconset_dir, target)
                
                if os.path.exists(source_path):
                    with Image.open(source_path) as img:
                        img_resized = img.resize((size, size), Image.Resampling.LANCZOS)
                        img_resized.save(target_path, "PNG")
                        print(f"✅ Créé : {target} ({size}x{size})")
                else:
                    print(f"⚠️  Fichier source manquant : {source_path}")
            
            # Créer le fichier .icns manuellement
            output_path = "icon.icns"  # Utiliser le nom de fichier directement
            create_icns_file(iconset_dir, output_path)
            
            print(f"🎉 Icône .icns créée : {output_path}")
            
    except Exception as e:
        print(f"❌ Erreur lors de la création de l'icône .icns : {e}")
        print("📝 L'icône sera créée lors du build sur macOS")

def create_icns_file(iconset_dir, output_path):
    """Crée un fichier .icns à partir des PNG dans iconset_dir"""
    
    # Structure du fichier .icns
    icns_header = b'icns'
    icns_size = 0
    
    # Collecter tous les fichiers PNG
    png_files = []
    for filename in os.listdir(iconset_dir):
        if filename.endswith('.png'):
            filepath = os.path.join(iconset_dir, filename)
            with open(filepath, 'rb') as f:
                png_data = f.read()
                png_files.append((filename, png_data))
    
    # Calculer la taille totale
    icns_size = 8  # Header
    for filename, png_data in png_files:
        icns_size += 8 + len(png_data)  # Entry header + data
    
    # Écrire le fichier .icns
    with open(output_path, 'wb') as f:
        # Écrire le header
        f.write(icns_header)
        f.write(struct.pack('>I', icns_size))
        
        # Écrire chaque icône
        for filename, png_data in png_files:
            # Déterminer le type d'icône basé sur le nom de fichier
            icon_type = get_icon_type(filename)
            if icon_type:
                # Écrire l'entrée
                entry_size = 8 + len(png_data)
                f.write(icon_type.encode('ascii'))
                f.write(struct.pack('>I', entry_size))
                f.write(png_data)

def get_icon_type(filename):
    """Détermine le type d'icône basé sur le nom de fichier"""
    if '16x16' in filename:
        return 'is32' if '@2x' not in filename else 's32 '
    elif '32x32' in filename:
        return 'il32' if '@2x' not in filename else 'l32 '
    elif '128x128' in filename:
        return 'ic08' if '@2x' not in filename else 'ic09'
    elif '256x256' in filename:
        return 'ic10' if '@2x' not in filename else 'ic11'
    elif '512x512' in filename:
        return 'ic12' if '@2x' not in filename else 'ic13'
    return None

if __name__ == "__main__":
    create_icns() 