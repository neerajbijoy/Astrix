/**
 * CDT-specific documentation / keyword requirements.
 *
 * These are the BASE requirements.
 * Payer rules can override whether a requirement is mandatory.
 */

const CDT_REQUIREMENTS = {
  D2740: {
    documents: [
      {
        key: 'CLINICAL_NOTES',
        label: 'Clinical notes',
        aliases: [
          'CLINICAL NOTES',
          'CLINICAL NOTE',
          'PROGRESS NOTE',
          'EXAM NOTE',
          'DENTAL NOTE'
        ]
      },
      {
        key: 'XRAY',
        label: 'Pre-op X-ray / radiograph',
        aliases: [
          'X-RAY',
          'XRAY',
          'RADIOGRAPH',
          'RADIOGRAPHIC',
          'INTRAORAL RADIOGRAPH'
        ]
      },
      {
        key: 'TREATMENT_PLAN',
        label: 'Treatment plan',
        aliases: [
          'TREATMENT PLAN',
          'TREATMENT_PLAN'
        ]
      }
    ],

    keywords: [
      {
        key: 'CLINICAL_NECESSITY',
        label: 'Clinical-necessity evidence',
        terms: [
          'decay',
          'caries',
          'recurrent caries',
          'recurrent decay',
          'fracture',
          'fractured',
          'broken',
          'cracked',
          'structural',
          'structural damage',
          'structural compromise',
          'breakdown',
          'cusp',
          'compromised',
          'loss of tooth structure',
          'tooth structure',
          'full coverage',
          'extensive restoration',
          'large restoration',
          'non-restorable'
        ]
      }
    ]
  },

  // Add other CDT codes here as the product expands.
  D2750: {
    documents: [
      {
        key: 'CLINICAL_NOTES',
        label: 'Clinical notes',
        aliases: [
          'CLINICAL NOTES',
          'CLINICAL NOTE',
          'PROGRESS NOTE',
          'EXAM NOTE'
        ]
      },
      {
        key: 'XRAY',
        label: 'Pre-op X-ray / radiograph',
        aliases: [
          'X-RAY',
          'XRAY',
          'RADIOGRAPH',
          'RADIOGRAPHIC'
        ]
      }
    ],

    keywords: [
      {
        key: 'CLINICAL_NECESSITY',
        label: 'Clinical-necessity evidence',
        terms: [
          'decay',
          'caries',
          'fracture',
          'fractured',
          'broken',
          'cracked',
          'structural',
          'breakdown',
          'cusp',
          'compromised',
          'tooth structure'
        ]
      }
    ]
  }
};


/**
 * Fallback requirements for CDT codes that don't yet
 * have a dedicated configuration.
 */
function getCdtTemplate(cdtCode) {
  const code = String(cdtCode || '').trim().toUpperCase();

  if (CDT_REQUIREMENTS[code]) {
    return CDT_REQUIREMENTS[code];
  }

  return {
    documents: [
      {
        key: 'CLINICAL_NOTES',
        label: 'Clinical notes',
        aliases: [
          'CLINICAL NOTES',
          'CLINICAL NOTE',
          'PROGRESS NOTE',
          'EXAM NOTE'
        ]
      }
    ],

    keywords: [
      {
        key: 'CLINICAL_NECESSITY',
        label: 'Clinical-necessity evidence',
        terms: [
          'decay',
          'caries',
          'fracture',
          'broken',
          'structural',
          'breakdown',
          'pain',
          'infection',
          'medical necessity'
        ]
      }
    ]
  };
}


/**
 * Build explicit checklist for the claim.
 */
function buildRequirementChecklist(
  cdtCode,
  payerRules = [],
  documents = [],
  narrative = '',
  extractedEvidence = {}
) {
  const template = getCdtTemplate(cdtCode);

  /*
   * Normalize uploaded document types.
   */
  const docTypes = documents.map(document =>
    String(document.document_type || '')
      .trim()
      .toUpperCase()
  );

  /*
   * Combine all available textual evidence.
   */
  const evidenceText = [
    String(narrative || '').toLowerCase(),

    ...documents.map(document =>
      String(document.extracted_text || '').toLowerCase()
    ),

    ...(extractedEvidence.conditions || []).map(condition =>
      String(condition).toLowerCase()
    ),

    ...(extractedEvidence.justifications || []).map(justification =>
      String(justification).toLowerCase()
    )
  ].join(' ');


  /*
   * Find payer rule for a particular requirement.
   */
  const findRule = key => {
    return payerRules.find(rule => {
      return (
        String(rule.requirement_type || '').trim().toUpperCase() ===
        String(key).trim().toUpperCase()
      );
    });
  };


  /*
   * Check whether an uploaded document matches aliases.
   */
  const hasDocument = aliases => {
    return docTypes.some(documentType => {
      return aliases.some(alias =>
        documentType.includes(String(alias).toUpperCase())
      );
    });
  };


  const items = [];


  /*
   * DOCUMENT REQUIREMENTS
   */
  for (const requirement of template.documents) {
    const payerRule = findRule(requirement.key);

    /*
     * If payer explicitly defines the rule, use it.
     *
     * Otherwise:
     * - TREATMENT_PLAN = optional by default
     * - everything else = required
     */
    const required = payerRule
      ? Boolean(payerRule.is_required)
      : requirement.key !== 'TREATMENT_PLAN';

    const present = hasDocument(requirement.aliases);

    let status;

    if (present) {
      status = 'PRESENT';
    } else if (required) {
      status = 'MISSING';
    } else {
      status = 'OPTIONAL';
    }

    items.push({
      key: requirement.key,
      type: 'DOCUMENT',
      label: requirement.label,
      required,
      present,
      status,

      evidence: present
        ? 'Matching uploaded document found.'
        : 'No matching uploaded document found.'
    });
  }


  /*
   * KEYWORD REQUIREMENTS
   */
  for (const requirement of template.keywords) {
    const payerRule = findRule(requirement.key);

    const required = payerRule
      ? Boolean(payerRule.is_required)
      : true;

    const matchedTerms = requirement.terms.filter(term =>
      evidenceText.includes(term.toLowerCase())
    );

    const present = matchedTerms.length > 0;

    let status;

    if (present) {
      status = 'PRESENT';
    } else if (required) {
      status = 'MISSING';
    } else {
      status = 'OPTIONAL';
    }

    items.push({
      key: requirement.key,
      type: 'KEYWORD',
      label: requirement.label,
      required,
      present,
      status,
      matched_terms: matchedTerms,
      expected_terms: requirement.terms
    });
  }


  /*
   * Only REQUIRED items participate in completeness.
   */
  const requiredItems = items.filter(item => item.required);

  const presentRequiredItems = requiredItems.filter(
    item => item.present
  );


  /*
   * IMPORTANT:
   *
   * If there are zero uploaded documents AND no narrative,
   * the checklist can NEVER be considered complete.
   */
  const hasAnyEvidence =
    documents.length > 0 ||
    String(narrative || '').trim().length > 0;


  const complete =
    hasAnyEvidence &&
    requiredItems.length > 0 &&
    presentRequiredItems.length === requiredItems.length;


  return {
    cdt_code: String(cdtCode || '').toUpperCase(),

    items,

    required_count: requiredItems.length,

    present_required_count: presentRequiredItems.length,

    complete
  };
}


module.exports = {
  getCdtTemplate,
  buildRequirementChecklist
};