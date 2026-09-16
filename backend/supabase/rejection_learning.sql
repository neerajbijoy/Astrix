-- Claim-Shield: payer rejection learning schema
-- Run this in Supabase SQL editor when using PostgreSQL persistence.

alter table claims add column if not exists owner_id text;
alter table audit_results add column if not exists owner_id text;
alter table claim_outcomes add column if not exists owner_id text;

-- Assign existing demo data to the default demo auditor once.
update claims set owner_id = 'demo-auditor' where owner_id is null;
update audit_results audits
set owner_id = claims.owner_id
from claims
where audits.claim_id = claims.id and audits.owner_id is null;
update claim_outcomes set owner_id = 'demo-auditor' where owner_id is null;

create index if not exists idx_claims_owner_id on claims(owner_id);
create index if not exists idx_audit_results_owner_id on audit_results(owner_id);
create index if not exists idx_claim_outcomes_owner_id on claim_outcomes(owner_id);

create table if not exists claim_outcomes (
  id uuid primary key default gen_random_uuid(),
  claim_id text,
  payer_id text not null,
  cdt_code text,
  outcome text not null check (outcome in ('APPROVED', 'REJECTED')),
  rejection_reason text,
  rejection_text text,
  features jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_claim_outcomes_payer on claim_outcomes(payer_id);
create index if not exists idx_claim_outcomes_reason on claim_outcomes(rejection_reason);
create index if not exists idx_claim_outcomes_created on claim_outcomes(created_at desc);

alter table audit_results add column if not exists rejection_prediction_json jsonb;
alter table audit_results add column if not exists requirement_checklist_json jsonb;
alter table audit_results add column if not exists policy_eligibility_json jsonb;
