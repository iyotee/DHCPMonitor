#!/usr/bin/env python3
"""
Script pour créer les icônes PNG manquantes
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_png_icon(size, filename):
    """Créer une icône PNG de la taille spécifiée à partir de icon.png"""
    try:
        # Charger l'image source
        source_img = Image.open("icon.png")
        
        # Redimensionner en gardant les proportions
        source_img.thumbnail((size, size), Image.Resampling.LANCZOS)
        
        # Créer une nouvelle image de la taille exacte
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        
        # Centrer l'image redimensionnée
        x = (size - source_img.width) // 2
        y = (size - source_img.height) // 2
        
        img.paste(source_img, (x, y))
        
        # Sauvegarder en PNG
        img.save(filename, format='PNG')
        print(f"Icône PNG créée : {filename} ({size}x{size})")
        
    except Exception as e:
        print(f"Erreur lors de la création de {filename}: {e}")
        # Fallback : créer une icône simple
        img = Image.new('RGBA', (size, size), (79, 70, 229, 255))
        img.save(filename, format='PNG')
        print(f"Icône PNG de fallback créée : {filename}")

def create_all_icons():
    """Créer toutes les icônes PNG nécessaires"""
    icons = [
        (32, "32x32.png"),
        (128, "128x128.png"),
        (256, "128x128@2x.png")  # 2x pour haute résolution
    ]
    
    for size, filename in icons:
        create_png_icon(size, filename)

if __name__ == "__main__":
    create_all_icons() 