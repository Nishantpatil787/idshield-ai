"""
IDShield AI — Biometric Privacy Guard & Data Hygiene

Implements privacy protection standards for face verification:
1. Prevents logging of raw image bytes, base64 strings, or facial embeddings.
2. Sanitizes debug structures to prevent sensitive biometric data leakage.
3. Provides safe log message formatting.
"""

from typing import Dict, Any, List

class BiometricPrivacyGuard:
    """Privacy and security utility for face verification processing."""

    @staticmethod
    def sanitize_log_dict(data: Dict[str, Any]) -> Dict[str, Any]:
        """Removes base64 image strings, raw bytes, and embedding arrays from dicts before logging."""
        sanitized = {}
        for key, val in data.items():
            if key in ("reference_image", "probe_image", "imagePayload", "documentImage", "selfieImage", "embedding", "vector"):
                if isinstance(val, str):
                    sanitized[key] = f"[REDACTED_IMAGE_DATA_BYTES_{len(val)}]"
                elif isinstance(val, list):
                    sanitized[key] = f"[REDACTED_EMBEDDING_VECTOR_DIM_{len(val)}]"
                else:
                    sanitized[key] = "[REDACTED]"
            elif isinstance(val, dict):
                sanitized[key] = BiometricPrivacyGuard.sanitize_log_dict(val)
            else:
                sanitized[key] = val
        return sanitized

    @staticmethod
    def format_safe_log(message: str, data: Any = None) -> str:
        """Formats a log string ensuring biometric privacy."""
        if data is None:
            return f"[FACE_VERIFICATION_AUDIT] {message}"
        if isinstance(data, dict):
            safe_data = BiometricPrivacyGuard.sanitize_log_dict(data)
            return f"[FACE_VERIFICATION_AUDIT] {message} | Data: {safe_data}"
        return f"[FACE_VERIFICATION_AUDIT] {message}"
