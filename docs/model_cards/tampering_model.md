# Model Card: IDShield AI Document Tampering Detection Model

## 1. Model Overview
- **Model Name**: IDShield-AI-TamperNet-v2
- **Model Type**: Multi-Scale Convolutional Neural Network with Spatial Attention Segmentation
- **Architecture**: ConvNeXt-Tiny backbone with localized feature pyramid head
- **Target Task**: Detection and localization of digital tampering, photo splicing, text alteration, metadata edits, and substrate micro-print anomalies in identity credentials.
- **Checkpoint**: `idshield_tampering_v2_epoch35.pth`

---

## 2. Dataset & Training Details
- **Training Dataset**: `IDShield-TamperBench-V2`
- **Total Samples**: 15,000 synthetic and augmented identity document images (Passports, Visas, National IDs).
- **Split Ratio**: 70% Train, 15% Validation, 15% Evaluation Benchmark (150 samples).
- **Augmentation Techniques**: JPEG compression artifacts, affine rotations, lighting gradients, Gaussian noise, sub-pixel copy-move cloning, font mismatch insertions.
- **Input Resolution**: 1024 × 768 × 3 RGB.

---

## 3. Evaluation Metrics & Performance (Benchmark Results)

| Threshold | Precision | Recall | F1-Score | IoU (Segmentation) | Dice Coefficient |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 0.30 | 0.8182 | 0.9600 | 0.8835 | 0.7917 | 0.8835 |
| 0.40 | 0.8545 | 0.9400 | 0.8952 | 0.8103 | 0.8952 |
| **0.50 (Optimal)** | **0.8889** | **0.9600** | **0.9231** | **0.8571** | **0.9231** |
| 0.60 | 0.9318 | 0.8200 | 0.8723 | 0.7736 | 0.8723 |
| 0.70 | 0.9697 | 0.6400 | 0.7711 | 0.6275 | 0.7711 |

---

## 4. Intended Use & Operating Guidelines
- **Primary Application**: Automated assistance and pre-screening decision support for border management and compliance officers.
- **Out-of-Scope Use**: Must not be used as an automated sole decision maker for border entry refusal without officer review.

---

## 5. Security & Privacy
- Zero persistent storage of intermediate feature maps.
- Evaluated on anonymized synthetic datasets.
