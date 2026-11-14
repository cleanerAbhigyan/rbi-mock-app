import sourceData from './sources.json';
import reviewData from './question-reviews.json';
import profileReviewData from './profile-reviews.json';
import traceData from './catalog-provenance.json';
import profileData from '../exam-profiles/profiles.json';
import { parseEvidence } from '../../features/intake/evidence';
import { createReferenceProfileRegistry } from '../../features/profiles/registry';

// Only public metadata is loaded here. Private intake files and operator modules are never imported.
export const publicEvidence = parseEvidence({
  sources: sourceData,
  reviews: reviewData,
  profileReviews: profileReviewData,
  provenance: traceData,
});
export const referenceProfiles = createReferenceProfileRegistry(profileData, {
  sources: publicEvidence.sources,
  reviews: publicEvidence.profileReviews,
});
export const sourceReadiness = {
  publicSources: publicEvidence.sources.length,
  approvedReviews: publicEvidence.reviews.filter(
    (r) => r.decision === 'approved',
  ).length,
  verifiedProfiles: referenceProfiles.verified().length,
};
