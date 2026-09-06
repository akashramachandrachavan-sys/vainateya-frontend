import time
import random
from typing import List, Dict, Any

class MockAIService:
    MODEL_VERSION = "naadvedh-yolo-v1.0.0"
    
    DEBRIS_CLASSES = [
        {
            "class": "fishing_gear",
            "label": "Ghost Fishing Net Bundle",
            "priority": "HIGH",
            "confidence_range": (0.88, 0.97),
            "dim_length": (3.5, 7.0),
            "dim_width": (1.2, 3.0),
            "shadow_mult": 1.4,
            "notes": "Complex woven acoustic backscatter with extensive acoustic shadow indicative of abandoned monofilament gillnet."
        },
        {
            "class": "container",
            "label": "Metallic Cargo Container",
            "priority": "CRITICAL",
            "confidence_range": (0.91, 0.98),
            "dim_length": (6.0, 12.2),
            "dim_width": (2.4, 2.6),
            "shadow_mult": 2.2,
            "notes": "Hard angular acoustic reflections with high specular return and well-defined shadow boundary."
        },
        {
            "class": "pipe",
            "label": "Unburied Pipeline Segment",
            "priority": "MEDIUM",
            "confidence_range": (0.82, 0.93),
            "dim_length": (10.0, 25.0),
            "dim_width": (0.6, 1.2),
            "shadow_mult": 0.8,
            "notes": "Linear cylindrical acoustic signature traversing seabed ripples."
        },
        {
            "class": "shipwreck_debris",
            "label": "Maritime Wreckage Scatter",
            "priority": "HIGH",
            "confidence_range": (0.84, 0.95),
            "dim_length": (4.0, 9.5),
            "dim_width": (2.0, 5.0),
            "shadow_mult": 1.6,
            "notes": "Scattered high-density debris field with irregular multi-point acoustic returns."
        },
        {
            "class": "artificial_anomaly",
            "label": "Unclassified Synthetic Anomaly",
            "priority": "MEDIUM",
            "confidence_range": (0.75, 0.89),
            "dim_length": (2.0, 4.0),
            "dim_width": (1.0, 2.5),
            "shadow_mult": 1.2,
            "notes": "Acoustic return inconsistent with surrounding sediment bathymetry."
        }
    ]

    @classmethod
    def run_inference(
        cls,
        image_path: str,
        survey_lat: float = 15.4128,
        survey_lon: float = 73.7842,
        img_width: int = 1200,
        img_height: int = 700
    ) -> Dict[str, Any]:
        """
        Simulates deep learning inference on a side-scan sonar image file.
        Returns standardized detection objects per the API contract.
        """
        start_time = time.time()
        
        # Determine number of anomalies to detect (2 to 4)
        num_detections = random.randint(2, 4)
        selected_types = random.sample(cls.DEBRIS_CLASSES, k=num_detections)
        
        detections = []
        for idx, debris_meta in enumerate(selected_types, start=1):
            conf = round(random.uniform(*debris_meta["confidence_range"]), 3)
            
            # Place detections either in left channel (0 to width//2 - 60) or right channel (width//2 + 60 to width)
            is_left_channel = random.random() < 0.5
            if is_left_channel:
                x = random.randint(120, max(130, img_width // 2 - 220))
            else:
                x = random.randint(img_width // 2 + 80, img_width - 240)
                
            y = random.randint(100, img_height - 180)
            w = random.randint(120, 240)
            h = random.randint(70, 150)

            # Spatial georeferencing relative to survey vessel track
            # 1 pixel approx 0.125m cross-track
            lat_offset = (random.uniform(-0.005, 0.005))
            lon_offset = (random.uniform(-0.005, 0.005))
            det_lat = round(survey_lat + lat_offset, 5)
            det_lon = round(survey_lon + lon_offset, 5)

            length_m = round(random.uniform(*debris_meta["dim_length"]), 1)
            width_m = round(random.uniform(*debris_meta["dim_width"]), 1)
            shadow_m = round(length_m * debris_meta["shadow_mult"], 1)

            detections.append({
                "code": f"DET-{random.randint(100, 999)}",
                "class_name": debris_meta["class"],
                "label": debris_meta["label"],
                "confidence": conf,
                "priority": debris_meta["priority"],
                "bbox": {
                    "x": x,
                    "y": y,
                    "width": w,
                    "height": h
                },
                "dimensions": {
                    "estimated_length_m": length_m,
                    "estimated_width_m": width_m,
                    "acoustic_shadow_length_m": shadow_m
                },
                "location": {
                    "latitude": det_lat,
                    "longitude": det_lon,
                    "depth_m": round(random.uniform(18.0, 42.0), 1)
                },
                "status": "DETECTED",
                "notes": debris_meta["notes"]
            })

        duration_ms = round((time.time() - start_time) * 1000 + random.uniform(220, 380), 1)

        return {
            "model_version": cls.MODEL_VERSION,
            "inference_duration_ms": duration_ms,
            "detections": detections
        }
