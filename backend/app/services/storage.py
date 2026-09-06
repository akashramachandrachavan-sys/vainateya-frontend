import os
import shutil
from pathlib import Path
from fastapi import UploadFile
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from ..config import settings

class StorageService:
    @staticmethod
    async def save_upload(file: UploadFile, survey_id: str) -> tuple[str, Path, int]:
        """Saves an uploaded file to the survey storage directory."""
        survey_dir = settings.STORAGE_DIR / "sonar_images" / survey_id
        os.makedirs(survey_dir, exist_ok=True)

        destination = survey_dir / file.filename
        size = 0
        with open(destination, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):
                buffer.write(chunk)
                size += len(chunk)

        # Relative path for serving
        rel_path = f"sonar_images/{survey_id}/{file.filename}"
        return rel_path, destination, size

    @staticmethod
    def generate_demo_sonar_image(survey_id: str, filename: str = "demo_sss_line_01.png") -> tuple[str, Path, int, int, int]:
        """
        Generates an authentic synthetic Side-Scan Sonar (SSS) acoustic waterfall image.
        Side-scan sonar imagery features:
        - Central dark water column (nadir zone below the towfish)
        - Port (left) and Starboard (right) acoustic channels
        - Speckled acoustic seabed backscatter with copper/amber false-color palette
        - High-reflectivity bright targets accompanied by elongated black acoustic shadows
        """
        survey_dir = settings.STORAGE_DIR / "sonar_images" / survey_id
        os.makedirs(survey_dir, exist_ok=True)
        filepath = survey_dir / filename

        width, height = 1200, 700
        
        # 1. Base acoustic texture: Copper/sepia sonar style (0 to 255)
        np.random.seed(42)
        base_noise = np.random.normal(loc=110, scale=28, size=(height, width)).clip(20, 240).astype(np.uint8)
        
        # 2. Central Nadir / Water column zone (dark strip down the center where sound travels before hitting bottom)
        center_x = width // 2
        nadir_width = 80
        for y in range(height):
            jitter = int(np.sin(y / 30.0) * 3)
            nx1 = max(0, center_x - nadir_width // 2 + jitter)
            nx2 = min(width, center_x + nadir_width // 2 + jitter)
            base_noise[y, nx1:nx2] = (base_noise[y, nx1:nx2] * 0.15).astype(np.uint8)
            # High intensity bottom bounce track at outer edge of nadir
            if nx1 > 0:
                base_noise[y, nx1-2:nx1] = 230
            if nx2 < width:
                base_noise[y, nx2:nx2+2] = 230

        # 3. Add seabed ripple formations (sand waves)
        for y in range(0, height, 8):
            ripple_shift = int(np.sin(y / 15.0) * 12)
            base_noise[y:y+2, 0:center_x-nadir_width//2] = np.clip(
                base_noise[y:y+2, 0:center_x-nadir_width//2].astype(int) + 25, 0, 255
            ).astype(np.uint8)

        # 4. Colorize to classic Side-Scan Sonar palette (Golden Amber / Copper)
        # Create RGB image
        rgb_img = np.zeros((height, width, 3), dtype=np.uint8)
        # Amber tone: R = val * 1.0, G = val * 0.72, B = val * 0.28
        rgb_img[:, :, 0] = np.clip(base_noise * 1.05, 0, 255).astype(np.uint8)
        rgb_img[:, :, 1] = np.clip(base_noise * 0.74, 0, 255).astype(np.uint8)
        rgb_img[:, :, 2] = np.clip(base_noise * 0.32, 0, 255).astype(np.uint8)

        # 5. Inject realistic acoustic target 1: Ghost Net bundle at (260, 180)
        # Bright acoustic highlight followed by black acoustic shadow pointing away from nadir (to the left)
        # Target highlight
        rgb_img[180:230, 310:350] = [255, 245, 180]
        # Acoustic shadow (no sound reaches behind target)
        rgb_img[180:230, 230:305] = [8, 5, 2]

        # 6. Inject realistic acoustic target 2: Shipping container at (720, 340)
        # Right channel: shadow extends to the right (away from nadir)
        rgb_img[340:390, 720:770] = [255, 250, 210]
        rgb_img[340:390, 775:880] = [6, 4, 1]

        # Convert to PIL and save
        pil_img = Image.fromarray(rgb_img)
        pil_img.save(filepath, format="PNG")
        
        size = filepath.stat().st_size
        rel_path = f"sonar_images/{survey_id}/{filename}"
        return rel_path, filepath, size, width, height
