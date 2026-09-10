"""
IDShield AI — Face Verifier

Compares reference and probe facial embeddings using cosine similarity,
evaluates quality and count edge cases, and produces explainable verification states.
"""

import math
from typing import Dict, Any, List
try:
    from ..schemas import create_verification_response, FaceVerificationStatus, QualityStatus
    from ..config import FaceVerificationConfig
except (ImportError, ValueError):
    from schemas import create_verification_response, FaceVerificationStatus, QualityStatus
    from config import FaceVerificationConfig


class FaceVerifier:
    """Calculates biometric similarity and determines verification state."""

    def __init__(self, config: FaceVerificationConfig = None):
        self.config = config or FaceVerificationConfig()

    def compute_cosine_similarity(self, vec_a: List[float], vec_b: List[float]) -> float:
        """Computes cosine similarity between two normalized embedding vectors."""
        if not vec_a or not vec_b or len(vec_a) != len(vec_b):
            return 0.0

        dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))

        if norm_a < 1e-9 or norm_b < 1e-9:
            return 0.0

        similarity = dot_product / (norm_a * norm_b)
        return max(0.0, min(1.0, similarity))

    def verify(
        self,
        ref_detection: Dict[str, Any],
        probe_detection: Dict[str, Any],
        ref_quality: Dict[str, Any],
        probe_quality: Dict[str, Any],
        ref_embedding: List[float],
        probe_embedding: List[float],
        execution_time_ms: float = 0.0
    ) -> Dict[str, Any]:
        """
        Executes biometric verification decision tree and returns structured response.
        """
        evidence: List[str] = []

        ref_detected = ref_detection.get("face_detected", False)
        probe_detected = probe_detection.get("face_detected", False)
        ref_count = ref_detection.get("face_count", 0)
        probe_count = probe_detection.get("face_count", 0)

        # 1. Check for missing face in either reference or probe image
        if not ref_detected or not probe_detected:
            if not ref_detected and not probe_detected:
                evidence.append("No faces detected in either reference or probe image")
            elif not ref_detected:
                evidence.append("Reference image does not contain a detectable face")
                evidence.append(f"Probe document image contains {probe_count} detected face(s)")
            else:
                evidence.append(f"Reference image contains {ref_count} detected face(s)")
                evidence.append("Probe document image does not contain a detectable face")

            return create_verification_response(
                status=FaceVerificationStatus.NOT_AVAILABLE,
                similarity_score=0.0,
                reference_face_detected=ref_detected,
                probe_face_detected=probe_detected,
                reference_face_count=ref_count,
                probe_face_count=probe_count,
                match_threshold=self.config.match_threshold,
                review_threshold=self.config.review_threshold,
                reference_quality=ref_quality,
                probe_quality=probe_quality,
                evidence=evidence,
                execution_time_ms=execution_time_ms
            )

        # Record face count evidence
        evidence.append(f"Reference face detected ({ref_count} face found)")
        evidence.append(f"Probe document face detected ({probe_count} face found)")

        # 2. Check for multiple faces ambiguity
        if ref_count > self.config.max_allowed_faces or probe_count > self.config.max_allowed_faces:
            if ref_count > 1:
                evidence.append(f"Ambiguous input: Reference image contains {ref_count} faces (expected single face)")
            if probe_count > 1:
                evidence.append(f"Ambiguous input: Probe document contains {probe_count} faces (expected single face)")
            evidence.append("Multiple face candidates require supervisor review")

            return create_verification_response(
                status=FaceVerificationStatus.REVIEW_REQUIRED,
                similarity_score=0.0,
                reference_face_detected=ref_detected,
                probe_face_detected=probe_detected,
                reference_face_count=ref_count,
                probe_face_count=probe_count,
                match_threshold=self.config.match_threshold,
                review_threshold=self.config.review_threshold,
                reference_quality=ref_quality,
                probe_quality=probe_quality,
                evidence=evidence,
                execution_time_ms=execution_time_ms
            )

        # 3. Compute cosine similarity score
        similarity = self.compute_cosine_similarity(ref_embedding, probe_embedding)
        evidence.append(f"Facial embedding cosine similarity: {round(similarity * 100, 1)}% ({round(similarity, 3)})")

        # 4. Check for poor image quality override
        ref_q_status = ref_quality.get("quality_status", QualityStatus.GOOD)
        probe_q_status = probe_quality.get("quality_status", QualityStatus.GOOD)

        has_quality_defect = (
            ref_q_status in (QualityStatus.POOR, QualityStatus.INVALID) or
            probe_q_status in (QualityStatus.POOR, QualityStatus.INVALID)
        )

        if has_quality_defect:
            for issue in ref_quality.get("issues", []):
                evidence.append(f"Reference quality issue: {issue}")
            for issue in probe_quality.get("issues", []):
                evidence.append(f"Probe quality issue: {issue}")
            evidence.append("Image quality is below optimal threshold; flagged for manual review rather than immediate rejection")

            return create_verification_response(
                status=FaceVerificationStatus.REVIEW_REQUIRED,
                similarity_score=similarity,
                reference_face_detected=ref_detected,
                probe_face_detected=probe_detected,
                reference_face_count=ref_count,
                probe_face_count=probe_count,
                match_threshold=self.config.match_threshold,
                review_threshold=self.config.review_threshold,
                reference_quality=ref_quality,
                probe_quality=probe_quality,
                evidence=evidence,
                execution_time_ms=execution_time_ms
            )

        # 5. Determine status based on configurable similarity thresholds
        if similarity >= self.config.match_threshold:
            status = FaceVerificationStatus.MATCH
            evidence.append(f"Similarity score ({round(similarity, 2)}) meets or exceeds match threshold ({self.config.match_threshold})")
            evidence.append("Facial biometric features strongly indicate matching identity holder")
        elif similarity >= self.config.review_threshold:
            status = FaceVerificationStatus.REVIEW_REQUIRED
            evidence.append(f"Similarity score ({round(similarity, 2)}) lies in review band ({self.config.review_threshold} - {self.config.match_threshold})")
            evidence.append("Secondary biometric review recommended before final clearance")
        else:
            status = FaceVerificationStatus.NO_MATCH
            evidence.append(f"Similarity score ({round(similarity, 2)}) is below review threshold ({self.config.review_threshold})")
            evidence.append("Facial feature cross-correlation indicates non-matching facial identities")

        return create_verification_response(
            status=status,
            similarity_score=similarity,
            reference_face_detected=ref_detected,
            probe_face_detected=probe_detected,
            reference_face_count=ref_count,
            probe_face_count=probe_count,
            match_threshold=self.config.match_threshold,
            review_threshold=self.config.review_threshold,
            reference_quality=ref_quality,
            probe_quality=probe_quality,
            evidence=evidence,
            execution_time_ms=execution_time_ms
        )
