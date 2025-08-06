#!/usr/bin/env python3
"""
Script pour créer une icône ICO valide pour Windows
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_ico():
    try:
        # Charger l'image source
        source_img = Image.open("icon.png")
        
        # Créer plusieurs tailles pour l'ICO
        sizes = [(16, 16), (32, 32), (48, 48)]
        images = []
        
        for size in sizes:
            # Redimensionner en gardant les proportions
            resized = source_img.copy()
            resized.thumbnail(size, Image.Resampling.LANCZOS)
            
            # Créer une image de la taille exacte
            img = Image.new('RGBA', size, (0, 0, 0, 0))
            
            # Centrer l'image redimensionnée
            x = (size[0] - resized.width) // 2
            y = (size[1] - resized.height) // 2
            
            img.paste(resized, (x, y))
            images.append(img)
        
        # Sauvegarder en ICO avec toutes les tailles
        images[0].save('icon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
        print("Icône ICO créée avec succès !")
        
    except Exception as e:
        print(f"Erreur lors de la création de l'ICO: {e}")
        # Fallback : créer une icône simple
        img = Image.new('RGBA', (32, 32), (79, 70, 229, 255))
        img.save('icon.ico', format='ICO', sizes=[(32, 32)])
        print("Icône ICO de fallback créée")

if __name__ == "__main__":
    create_ico()