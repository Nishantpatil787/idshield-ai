"""
IDShield AI — End-to-End Face Verification Inference Pipeline

Provides main FaceVerificationEngine class for executing face verification
on reference and probe image payloads.
"""

import time
from typing import Dict, Any, Optional
try:
    from .config import FaceVerificationConfig
    from .detection.face_detector import FaceDetector
    from .quality.face_quality import FaceQualityAnalyzer
    from .embedding.face_embedding import FaceEmbeddingExtractor
    from .verification.face_verifier import FaceVerifier
    from .schemas import create_verification_response, FaceVerificationStatus
    from .privacy import BiometricPrivacyGuard
except (ImportError, ValueError):
    from config import FaceVerificationConfig
    from detection.face_detector import FaceDetector
    from quality.face_quality import FaceQualityAnalyzer
    from embedding.face_embedding import FaceEmbeddingExtractor
    from verification.face_verifier import FaceVerifier
    from schemas import create_verification_response, FaceVerificationStatus
    from privacy import BiometricPrivacyGuard


class FaceVerificationEngine:
    """Production-structured, research-grade Face Verification Engine."""

    def __init__(self, config: Optional[FaceVerificationConfig] = None):
        self.config = config or FaceVerificationConfig()
        self.detector = FaceDetector(min_confidence=self.config.min_detection_confidence)
        self.quality_analyzer = FaceQualityAnalyzer(min_quality_score=self.config.min_quality_score)
        self.embedding_extractor = FaceEmbeddingExtractor(embedding_dim=self.config.embedding_dimension)
        self.verifier = FaceVerifier(config=self.config)

    def verify_faces(
        self,
        reference_image: str,
        probe_image: str,
        config_override: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes complete face verification workflow.
        
        Args:
            reference_image: Base64 data URL or string for reference/selfie photo
            probe_image: Base64 data URL or string for document face photo
            config_override: Optional threshold override dictionary
            
        Returns:
            Structured result dictionary matching milestone schema.
        """
        start_time = time.time()

        # Apply runtime threshold overrides if provided
        if config_override and isinstance(config_override, dict):
            active_config = FaceVerificationConfig(
                match_threshold=float(config_override.get("match_threshold", self.config.match_threshold)),
                review_threshold=float(config_override.get("review_threshold", self.config.review_threshold)),
                min_detection_confidence=float(config_override.get("min_detection_confidence", self.config.min_detection_confidence)),
                min_quality_score=float(config_override.get("min_quality_score", self.config.min_quality_score)),
                max_allowed_faces=int(config_override.get("max_allowed_faces", self.config.max_allowed_faces))
            )
            verifier = FaceVerifier(config=active_config)
        else:
            verifier = self.verifier

        # Step 1: Input Validation
        if not reference_image or not probe_image:
            exec_ms = (time.time() - start_time) * 1000
            missing_ref = not reference_image
            missing_probe = not probe_image
            evidence = []
            if missing_ref and missing_probe:
                evidence.append("Both reference_image and probe_image payloads are missing")
            elif missing_ref:
                evidence.append("reference_image payload is missing")
            else:
                evidence.append("probe_image payload is missing")

            return create_verification_response(
                status=FaceVerificationStatus.INVALID_INPUT,
                similarity_score=0.0,
                reference_face_detected=False,
                probe_face_detected=False,
                reference_face_count=0,
                probe_face_count=0,
                match_threshold=verifier.config.match_threshold,
                review_threshold=verifier.config.review_threshold,
                reference_quality={"quality_score": 0.0, "quality_status": "INVALID", "issues": ["Missing image payload"]},
                probe_quality={"quality_score": 0.0, "quality_status": "INVALID", "issues": ["Missing image payload"]},
                evidence=evidence,
                execution_time_ms=exec_ms
            )

        # Step 2: Face Detection
        ref_detection = self.detector.detect_faces(reference_image)
        probe_detection = self.detector.detect_faces(probe_image)

        # Step 3: Quality Analysis
        ref_quality = self.quality_analyzer.analyze_quality(reference_image, ref_detection)
        probe_quality = self.quality_analyzer.analyze_quality(probe_image, probe_detection)

        # Step 4: Embedding Generation (only if faces are detected)
        ref_embedding = []
        if ref_detection.get("face_detected") and ref_detection.get("faces"):
            bbox = ref_detection["faces"][0]["bbox"]
            ref_embedding = self.embedding_extractor.extract_embedding(reference_image, bbox)

        probe_embedding = []
        if probe_detection.get("face_detected") and probe_detection.get("faces"):
            bbox = probe_detection["faces"][0]["bbox"]
            probe_embedding = self.embedding_extractor.extract_embedding(probe_image, bbox)

        exec_ms = (time.time() - start_time) * 1000

        # Step 5: Face Verification & State Evaluation
        result = verifier.verify(
            ref_detection=ref_detection,
            probe_detection=probe_detection,
            ref_quality=ref_quality,
            probe_quality=probe_quality,
            ref_embedding=ref_embedding,
            probe_embedding=probe_embedding,
            execution_time_ms=exec_ms
        )

        return result


# Convenience function for single-call invocation
def run_face_verification(
    reference_image: str,
    probe_image: str,
    config_override: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    engine = FaceVerificationEngine()
    return engine.verify_faces(reference_image, probe_image, config_override)
