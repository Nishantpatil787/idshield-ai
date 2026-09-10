"""
IDShield AI — Face Verification Module Configuration

Contains default thresholds, face quality minimums, and detection options.
All values are configurable via environment variables or runtime overrides.
"""

import os
from dataclasses import dataclass, field
from typing import Dict, Any, Optional

# Default Thresholds (Configurable Prototype Thresholds)
DEFAULT_MATCH_THRESHOLD: float = float(os.getenv("FACE_MATCH_THRESHOLD", "0.80"))
DEFAULT_REVIEW_THRESHOLD: float = float(os.getenv("FACE_REVIEW_THRESHOLD", "0.65"))
DEFAULT_MIN_DETECTION_CONFIDENCE: float = float(os.getenv("FACE_MIN_DETECTION_CONFIDENCE", "0.60"))
DEFAULT_MIN_QUALITY_SCORE: float = float(os.getenv("FACE_MIN_QUALITY_SCORE", "0.50"))
DEFAULT_MAX_ALLOWED_FACES: int = int(os.getenv("FACE_MAX_ALLOWED_FACES", "1"))

@dataclass
class FaceVerificationConfig:
    """Configurable settings for face detection, quality, and similarity verification."""
    match_threshold: float = DEFAULT_MATCH_THRESHOLD
    review_threshold: float = DEFAULT_REVIEW_THRESHOLD
    min_detection_confidence: float = DEFAULT_MIN_DETECTION_CONFIDENCE
    min_quality_score: float = DEFAULT_MIN_QUALITY_SCORE
    max_allowed_faces: int = DEFAULT_MAX_ALLOWED_FACES
    require_single_face: bool = True
    embedding_dimension: int = 128
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "match_threshold": self.match_threshold,
            "review_threshold": self.review_threshold,
            "min_detection_confidence": self.min_detection_confidence,
            "min_quality_score": self.min_quality_score,
            "max_allowed_faces": self.max_allowed_faces,
            "require_single_face": self.require_single_face,
            "embedding_dimension": self.embedding_dimension,
        }

    @classmethod
    def from_dict(cls, d: Optional[Dict[str, Any]] = None):
        if not d:
            return cls()
        fields = {f for f in cls.__dataclass_fields__}
        return cls(**{k: v for k, v in d.items() if k in fields})
