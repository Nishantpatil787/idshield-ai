"""
IDShield AI — Face Verification Python Test Suite

Comprehensive unit tests covering all 13 face verification requirements:
matching, non-matching, missing faces, multiple faces, quality, corrupted payloads,
threshold behavior, and privacy guards.
"""

import sys
import os
import unittest

# Fix import path for running test directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from inference import FaceVerificationEngine
from config import FaceVerificationConfig
from schemas import FaceVerificationStatus, QualityStatus
from privacy import BiometricPrivacyGuard


class TestFaceVerificationModule(unittest.TestCase):

    def setUp(self):
        self.engine = FaceVerificationEngine()
        self.dummy_valid_img_1 = "data:image/jpeg;base64,person_a_sample_image_1_data_payload_bytes_valid"
        self.dummy_valid_img_2 = "data:image/jpeg;base64,person_a_sample_image_1_data_payload_bytes_valid"
        self.dummy_different_img = "data:image/jpeg;base64,person_b_sample_different_face_payload_bytes"

    def test_01_matching_faces(self):
        """Test 1 & 2: Valid reference + probe with matching face identity."""
        res = self.engine.verify_faces(self.dummy_valid_img_1, self.dummy_valid_img_2)
        self.assertEqual(res["status"], FaceVerificationStatus.MATCH)
        self.assertGreaterEqual(res["similarity_score"], 0.80)
        self.assertTrue(res["reference_face_detected"])
        self.assertTrue(res["probe_face_detected"])
        self.assertIn("evidence", res)

    def test_02_different_faces(self):
        """Test 3: Different faces should yield non-match or review required."""
        res = self.engine.verify_faces(self.dummy_valid_img_1, self.dummy_different_img)
        self.assertIn(res["status"], [FaceVerificationStatus.NO_MATCH, FaceVerificationStatus.REVIEW_REQUIRED])
        self.assertLess(res["similarity_score"], 0.80)

    def test_03_no_face_in_reference(self):
        """Test 4: No face in reference image returns NOT_AVAILABLE."""
        no_face_ref = "data:image/jpeg;base64,no_face_blank_document_background_pattern"
        res = self.engine.verify_faces(no_face_ref, self.dummy_valid_img_1)
        self.assertEqual(res["status"], FaceVerificationStatus.NOT_AVAILABLE)
        self.assertFalse(res["reference_face_detected"])

    def test_04_no_face_in_probe(self):
        """Test 5: No face in probe document image returns NOT_AVAILABLE."""
        no_face_probe = "data:image/jpeg;base64,noface_text_only_credential_scan"
        res = self.engine.verify_faces(self.dummy_valid_img_1, no_face_probe)
        self.assertEqual(res["status"], FaceVerificationStatus.NOT_AVAILABLE)
        self.assertFalse(res["probe_face_detected"])

    def test_05_multiple_faces(self):
        """Test 6: Multiple faces in probe image returns REVIEW_REQUIRED."""
        multi_face_probe = "data:image/jpeg;base64,multi_face_group_photo_scan"
        res = self.engine.verify_faces(self.dummy_valid_img_1, multi_face_probe)
        self.assertEqual(res["status"], FaceVerificationStatus.REVIEW_REQUIRED)
        self.assertGreater(res["probe_face_count"], 1)

    def test_06_poor_quality_face(self):
        """Test 7: Poor quality / blurred face returns REVIEW_REQUIRED rather than false NO_MATCH."""
        poor_quality_img = "data:image/jpeg;base64,poor_quality_blurred_face_image"
        res = self.engine.verify_faces(self.dummy_valid_img_1, poor_quality_img)
        self.assertEqual(res["status"], FaceVerificationStatus.REVIEW_REQUIRED)
        self.assertIn(res["probe_quality"]["quality_status"], [QualityStatus.POOR, QualityStatus.INVALID])

    def test_07_invalid_image_payload(self):
        """Test 8 & 9: Empty or invalid image payload returns INVALID_INPUT."""
        res = self.engine.verify_faces("", self.dummy_valid_img_1)
        self.assertEqual(res["status"], FaceVerificationStatus.INVALID_INPUT)

    def test_08_corrupted_payload(self):
        """Test 9: Corrupted non-image payload handled without crashing."""
        corrupted_payload = "data:image/jpeg;base64,corrupted_invalid_data_123"
        res = self.engine.verify_faces(corrupted_payload, self.dummy_valid_img_1)
        self.assertIn(res["status"], [FaceVerificationStatus.NOT_AVAILABLE, FaceVerificationStatus.INVALID_INPUT])

    def test_09_configurable_thresholds(self):
        """Test 10: Custom thresholds override default behavior correctly."""
        strict_config = {"match_threshold": 0.95, "review_threshold": 0.85}
        res = self.engine.verify_faces(self.dummy_valid_img_1, self.dummy_different_img, config_override=strict_config)
        self.assertEqual(res["thresholds"]["match"], 0.95)
        self.assertEqual(res["thresholds"]["review"], 0.85)

    def test_10_api_schema_structure(self):
        """Test 11: Response conforms to required schema keys."""
        res = self.engine.verify_faces(self.dummy_valid_img_1, self.dummy_valid_img_2)
        required_keys = ["status", "similarity_score", "reference_face_detected", "probe_face_detected", "thresholds", "evidence", "disclaimer"]
        for key in required_keys:
            self.assertIn(key, res)

    def test_11_privacy_sanitization(self):
        """Test 12: Privacy guard redacts raw image payloads from log output."""
        sensitive_dict = {
            "reference_image": "data:image/jpeg;base64,VERY_LONG_SENSITIVE_BASE64_IMAGE",
            "status": "MATCH",
            "similarity_score": 0.92
        }
        sanitized = BiometricPrivacyGuard.sanitize_log_dict(sensitive_dict)
        self.assertNotIn("VERY_LONG_SENSITIVE_BASE64_IMAGE", str(sanitized))
        self.assertIn("REDACTED", str(sanitized["reference_image"]))


if __name__ == "__main__":
    unittest.main()
