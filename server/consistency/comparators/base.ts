/**
 * IDShield AI — Base Comparator Interface
 */

import { NormalizedIdentityProfile, CrossDocumentFieldComparison, CrossDocumentConfig } from '../types';

export interface ICrossDocumentComparator {
  id: string;
  field: string;
  label: string;
  compare(
    docA: NormalizedIdentityProfile,
    docB: NormalizedIdentityProfile,
    config?: CrossDocumentConfig
  ): CrossDocumentFieldComparison | null;
}
