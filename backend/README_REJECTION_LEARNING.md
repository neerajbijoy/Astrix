# Payer Rejection Learning

Claim-Shield now includes a payer-specific rejection-learning layer.

## Flow

`Claim -> existing audit/rule engine -> feature extraction -> historical payer outcomes -> similarity-weighted learner -> rejection risk + ranked reasons`

### Current prototype model

`Payer Pattern Learner v1` is a dependency-free, similarity-weighted k-nearest-neighbor model. It uses:

- payer ID
- CDT code
- X-ray availability
- clinical note availability
- treatment-plan availability
- clinical-justification detection
- tooth/documentation mismatch
- procedure validity
- narrative token overlap

It returns both a rejection-risk estimate and the most likely rejection reasons, with supporting-claim counts and similarity scores.

## API

- `POST /api/rejection-learning/predict/:claimId`
- `GET /api/rejection-learning/patterns?payer_id=<id>`
- `GET /api/rejection-learning/history?payer_id=<id>`
- `POST /api/rejection-learning/outcomes`

The outcomes endpoint is the learning feedback loop. After a claim is adjudicated, send `APPROVED` or `REJECTED` plus the payer's rejection reason/text. Rejection text is normalized into a stable category.

## Production upgrade

The included historical records are synthetic demonstration data. For real deployment, replace them with de-identified adjudication outcomes. Once there are enough observations per payer/CDT combination, the same feature contract can feed a calibrated gradient-boosting classifier and/or sentence embeddings for richer rejection-text clustering.
