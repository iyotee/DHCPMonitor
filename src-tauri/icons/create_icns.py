#!/usr/bin/env python3
"""
Script pour créer l'icône .icns pour macOS
Utilise les icônes PNG existantes pour créer un fichier .icns
"""

import os
import subprocess
import tempfile
import shutil
from PIL import Image

def create_icns():
    """Crée l'icône .icns pour macOS"""
    
    # Vérifier si nous sommes sur macOS
    if os.name != 'posix' or not os.path.exists('/usr/bin/iconutil'):
        print("⚠️  Ce script nécessite macOS pour créer l'icône .icns")
        print("📝 L'icône sera créée lors du build sur macOS")
        return
    
    try:
        # Créer un dossier temporaire pour l'icône
        with tempfile.TemporaryDirectory() as temp_dir:
            iconset_dir = os.path.join(temp_dir, "icon.iconset")
            os.makedirs(iconset_dir)
            
            # Copier les icônes PNG existantes
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
            
            for source, target, size in icon_sizes:
                source_path = os.path.join("src-tauri/icons", source)
                target_path = os.path.join(iconset_dir, target)
                
                if os.path.exists(source_path):
                    with Image.open(source_path) as img:
                        img_resized = img.resize((size, size), Image.Resampling.LANCZOS)
                        img_resized.save(target_path, "PNG")
                        print(f"✅ Créé : {target} ({size}x{size})")
            
            # Créer le fichier .icns
            output_path = "src-tauri/icons/icon.icns"
            subprocess.run([
                "iconutil", "-c", "icns", iconset_dir, "-o", output_path
            ], check=True)
            
            print(f"🎉 Icône .icns créée : {output_path}")
            
    except Exception as e:
        print(f"❌ Erreur lors de la création de l'icône .icns : {e}")
        print("📝 L'icône sera créée lors du build sur macOS")

if __name__ == "__main__":
    create_icns() 