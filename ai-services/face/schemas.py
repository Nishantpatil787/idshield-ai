"""
IDShield AI — Face Verification Schemas

Defines structured data classes / dictionaries for face detection,
quality evaluation, embedding, and verification results.
"""

from typing import List, Dict, Any, Optional
from enum import Enum


class FaceVerificationStatus(str, Enum):
    MATCH = "MATCH"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    NO_MATCH = "NO_MATCH"
    NOT_AVAILABLE = "NOT_AVAILABLE"
    INVALID_INPUT = "INVALID_INPUT"


class QualityStatus(str, Enum):
    GOOD = "GOOD"
    ACCEPTABLE = "ACCEPTABLE"
    POOR = "POOR"
    INVALID = "INVALID"


def create_face_bounding_box(x1: int, y1: int, x2: int, y2: int, confidence: float) -> Dict[str, Any]:
    return {
        "bbox": [x1, y1, x2, y2],
        "confidence": round(confidence, 4)
    }


def create_detection_result(
    face_detected: bool,
    face_count: int,
    faces: List[Dict[str, Any]],
    image_width: int = 0,
    image_height: int = 0
) -> Dict[str, Any]:
    return {
        "face_detected": face_detected,
        "face_count": face_count,
        "faces": faces,
        "image_dimensions": {"width": image_width, "height": image_height}
    }


def create_quality_result(
    quality_score: float,
    quality_status: str,
    issues: List[str],
    metrics: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    return {
        "quality_score": round(quality_score, 4),
        "quality_status": quality_status,
        "issues": issues,
        "metrics": metrics or {}
    }


def create_verification_response(
    status: str,
    similarity_score: float,
    reference_face_detected: bool,
    probe_face_detected: bool,
    reference_face_count: int,
    probe_face_count: int,
    match_threshold: float,
    review_threshold: float,
    reference_quality: Dict[str, Any],
    probe_quality: Dict[str, Any],
    evidence: List[str],
    execution_time_ms: float = 0.0,
    disclaimer: str = "Face verification is an AI-assisted similarity assessment and is not a legally conclusive identity determination."
) -> Dict[str, Any]:
    return {
        "status": status,
        "similarity_score": round(similarity_score, 4),
        "reference_face_detected": reference_face_detected,
        "probe_face_detected": probe_face_detected,
        "reference_face_count": reference_face_count,
        "probe_face_count": probe_face_count,
        "thresholds": {
            "match": match_threshold,
            "review": review_threshold
        },
        "reference_quality": reference_quality,
        "probe_quality": probe_quality,
        "evidence": evidence,
        "execution_time_ms": round(execution_time_ms, 2),
        "disclaimer": disclaimer
    }
