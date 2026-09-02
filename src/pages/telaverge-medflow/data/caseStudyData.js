/* ─── MedFlow case-study content ─────────────────────────────────────────────
   Every fact on this page lives here, once. Sections import from this file
   rather than restating anything, which is the only reliable way to stop a
   twenty-section document from contradicting itself: the workflow, the risk
   analysis, the traceability chain and the proposed test protocol all describe
   the SAME eleven steps and the SAME ten user needs, because they all read the
   same arrays.

   ─────────────────────────────────────────────────────────────────────────
   ACCURACY BOUNDARY — the rule this whole file exists to hold
   ─────────────────────────────────────────────────────────────────────────
   MedFlow is an independent conceptual study. Nothing here may be phrased so
   that a reader could believe it describes real clinical work, real testing,
   or real regulatory activity.

   Every user need is "conceptual". Every risk row is "potential" and
   "possible". Every study is "proposed". Every finding is an illustration of
   how a finding WOULD feed back into design, never a result. The medication is
   "Med-A" and its values are UI content, never dosing guidance.

   Words that are permitted:  conceptual, illustrative, proposed, exploratory,
   informed by, potential use error, simulated, design consideration.

   Words that are NOT permitted anywhere on this page:  compliant, validated,
   approved, certified, tested with clinicians, prevents errors, clinically
   safe, UFMEA (as a completed artifact).
   ───────────────────────────────────────────────────────────────────────── */

export const STUDY = {
  name: 'MedFlow',
  subtitle: 'Safety-Oriented Infusion Management UX Study',
  label: 'Independent concept study · 2026',
  eyebrow: 'Independent concept study · Medical UX',
  lead:
    'Exploring how Human Factors principles, task analysis, use-related risk thinking and iterative UI design can support safer interactions in a conceptual hospital infusion workflow.',
  meta: [
    ['Role', 'UI/UX Design · Product Thinking'],
    ['Focus', 'Human Factors · Safety-Critical UX'],
    ['Platform', 'Clinical Tablet / Web Application'],
    ['Tools', 'Figma · Relume · Antigravity · Claude Code'],
    ['Year', '2026'],
  ],
};

export const DISCLAIMER =
  'MedFlow is an independent conceptual design study created for portfolio and learning purposes. It is not affiliated with Telaverge, LTTS, or any medical-device manufacturer and is not intended for clinical use. All patient information, medications, values, workflows, and clinical scenarios shown are fictional. This study demonstrates UX and Human Factors methodology and does not claim IEC 62366 compliance, FDA compliance, clinical validation, or regulatory approval.';

/* ─── 03 · The therapy ─────────────────────────────────────────────────────────
   WHAT AN INFUSION IS, AND WHY THE RATE FIELD IS THE ONE THAT MATTERS.

   This block was missing, and its absence was the largest hole in the study: the
   page demonstrated an interface guard against a rate-entry error without ever
   explaining why a rate error is worth guarding against. A reader who is not
   clinical — which includes most hiring managers — had no way to tell whether
   the discrepancy screen was solving a real problem or an invented one.

   Everything here is either general knowledge about how infusion pumps work, or
   arithmetic on this study's own fictional numbers. Neither is a clinical claim.
   What is deliberately NOT here: what Med-A is, what it treats, whether any of
   these values would be appropriate for anyone. Those would be fabricated
   clinical content, which is the one thing this page must not contain. */

export const THERAPY = {
  definition:
    'An infusion delivers fluid — usually with medication dissolved in it — directly into a vein through a catheter. Not as a single injection, but continuously over hours, at a rate metered by an electronic pump.',

  /* Each number mapped to where it acts in the physical setup. */
  parameters: [
    {
      id: 'concentration',
      label: 'Concentration',
      value: '10 mg/mL',
      where: 'In the bag',
      means: 'How much medication is dissolved in each millilitre of fluid. Set when the infusion is prepared, not by the nurse at the bedside.',
      editable: false,
    },
    {
      id: 'rate',
      label: 'Infusion rate',
      value: '5 mL/hr',
      where: 'On the pump',
      means: 'How many millilitres the pump pushes every hour. This is the field the nurse types, and the one this study guards.',
      editable: true,
      critical: true,
    },
    {
      id: 'volume',
      label: 'Volume',
      value: '100 mL',
      where: 'In the bag',
      means: 'The total amount to be delivered. Together with the rate, it determines how long the infusion runs.',
      editable: true,
    },
  ],

  /* The consequence, stated as arithmetic rather than as a clinical judgement.
     This is the sentence the entire study rests on. */
  arithmetic: {
    correct: { rate: '5 mL/hr', perHour: '50 mg/hr', duration: '20 hours' },
    mistyped: { rate: '50 mL/hr', perHour: '500 mg/hr', duration: '2 hours' },
  },

  whyRate:
    'A pump does not deliver once. It repeats whatever number it was given, every hour, unattended, while the nurse is with other patients. A wrong value in an ordinary form is a typo; a wrong value in a pump is a typo that keeps executing until somebody notices it.',

  notDosing:
    'These figures are illustrative UI content and the arithmetic above is arithmetic — not dosing guidance, and not a statement that any of these values would be appropriate for any patient.',
};

/* ─── Timing ───────────────────────────────────────────────────────────────────
   EVERY CLOCK VALUE ON THE PAGE IS DERIVED FROM THE RATE AND THE VOLUME, so the
   screens cannot contradict each other or the therapy explainer.

   They did. The active screen said "82 mL remaining, est. complete 14:32" while
   the completion screen said "started 10:12, duration 4 hr 20 min" — but 100 mL
   at 5 mL/hr is a twenty-hour infusion, so 4 hr 20 min was impossible and the
   two screens disagreed with each other AND with section 03, which states the
   bag runs 20 hours. Three sources, three different answers, because each was
   typed by hand.

   Now there is one source: rate, volume, volume delivered, and a start time.
   Everything else is computed.

   All times are 12-hour with a meridiem. "14:32" is unambiguous to a European
   reader and genuinely ambiguous to a North American one, and a clinical
   interface should not make anyone do arithmetic to read a clock. */

const RATE_ML_HR = 5;
const VOLUME_ML = 100;
const DELIVERED_ML = 18;
const START_MINUTES = 10 * 60 + 12; // 10:12 in the morning

/* 12-hour clock with meridiem. Minutes may roll past midnight, so it wraps. */
function clock(totalMinutes) {
  const m = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  const mer = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mm} ${mer}`;
}

/* "16 hr 24 min", and "24 min" when there is no hour to show. */
function duration(totalMinutes) {
  const m = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (!h) return `${mm} min`;
  if (!mm) return `${h} hr`;
  return `${h} hr ${mm} min`;
}

const REMAINING_ML = VOLUME_ML - DELIVERED_ML;          // 82
const TOTAL_MINUTES = (VOLUME_ML / RATE_ML_HR) * 60;    // 1200 → 20 hr
const ELAPSED_MINUTES = (DELIVERED_ML / RATE_ML_HR) * 60; // 216 → 3 hr 36 min
const REMAINING_MINUTES = TOTAL_MINUTES - ELAPSED_MINUTES; // 984 → 16 hr 24 min

export const TIMING = {
  rate: RATE_ML_HR,
  volume: VOLUME_ML,
  deliveredMl: DELIVERED_ML,
  remainingMl: REMAINING_ML,

  startedAt: clock(START_MINUTES),                                  // 10:12 AM
  nowAt: clock(START_MINUTES + ELAPSED_MINUTES),                    // 1:48 PM
  completesAt: clock(START_MINUTES + TOTAL_MINUTES),                // 6:12 AM
  finishedAt: clock(START_MINUTES + TOTAL_MINUTES),                 // 6:12 AM

  totalDuration: duration(TOTAL_MINUTES),                           // 20 hr
  elapsedDuration: duration(ELAPSED_MINUTES),                       // 3 hr 36 min
  remainingDuration: duration(REMAINING_MINUTES),                   // 16 hr 24 min

  /* Seconds, for the live countdown on the monitoring screen. */
  remainingSeconds: REMAINING_MINUTES * 60,
  percentDelivered: Math.round((DELIVERED_ML / VOLUME_ML) * 100),   // 18

  /* ── The device's own clock ──────────────────────────────────────────────
     This is the SCENARIO's clock, not the reader's system clock. Showing real
     wall-time would contradict everything else on the screen: at 4pm on a
     Tuesday in the reader's timezone, "82 mL remaining, started 10:12 AM"
     stops adding up. The device shows the time it is inside the scenario.

     The date is written as a real Date and formatted, rather than typed as a
     string, so the weekday can never disagree with the date — the classic way
     a hand-written "Tue 17 Mar" ends up on a Thursday. */
  nowSeconds: (START_MINUTES + ELAPSED_MINUTES) * 60,
  dateLabel: new Date('2026-03-17T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }),
};

/* ─── 03 · Scenario ────────────────────────────────────────────────────────── */

export const SCENARIO = {
  patient: {
    name: 'Maya Patel',
    age: '62 years old',
    context: 'Post-operative inpatient',
    room: 'Room 412',
    id: 'MP-20481',
    dob: '14 Feb 1964',
    initials: 'MP',
  },
  user: { name: 'Sarah', role: 'Registered Nurse' },
  environment: 'Post-operative hospital ward',
  situation:
    'Maya is recovering following surgery and has a simulated IV medication order. Her nurse must verify the correct patient, review the medication order, configure the infusion, confirm the settings, initiate therapy, monitor its status, and respond appropriately if the system detects an abnormal condition.',
  /* Illustrative UI content. These are numbers chosen to make an interface
     legible — they are not, and must never be described as, appropriate
     dosing. */
  order: {
    medication: 'Med-A',
    concentration: '10 mg/mL',
    rate: '5 mL/hr',
    volume: '100 mL',
    prescriber: 'Dr. Chen',
  },

  /* ── The prescriber, in full ───────────────────────────────────────────────
     "Dr. Chen" alone is not enough to act on. If a nurse needs to question an
     order at 3am she needs to know WHICH Chen, whether they are the right
     person to ask, and how to reach them — so the name expands on demand into
     the full identity rather than sending her to a separate directory.

     Progressive disclosure rather than always-on: the ordering clinician is
     context on a normal run and only becomes the primary information when
     something needs querying. Fictional, like everything else here. */
  prescriberDetail: {
    short: 'Dr. Chen',
    full: 'Dr. Evelyn Chen',
    credentials: 'MD, FRCSC',
    title: 'Attending Physician',
    specialty: 'General Surgery',
    contact: 'Pager 4471',
    /* Meridiem, like every other clock value on the page. The order is placed
       before the infusion starts at 10:12 AM. */
    ordered: 'Today, 7:20 AM',
  },
  /* The value the prototype seeds into the rate field so the discrepancy path
     can be demonstrated. Ten times the ordered rate — a plausible decimal /
     extra-digit slip rather than an arbitrary wrong number. */
  mistypedRate: '50',
  correctRate: '5',
};

/* ─── Escalation ───────────────────────────────────────────────────────────────
   TWO DIFFERENT ESCALATIONS, DELIBERATELY NOT THE SAME CONTROL.

   ── 1. The order-change request ──
   The discrepancy screen previously had exactly one way out: correct the value.
   That is right when the nurse mistyped, and wrong when she did not — a rate
   genuinely may need to change, and a system whose only answer to "the order is
   wrong" is "type what the order says" is a system that teaches its users to
   work around it.

   But the fix is NOT an override. Letting the nurse authorise her own departure
   from a prescribed order would delete the guard entirely: any blocking state
   with a "proceed anyway" button becomes a button people learn to press. What
   the interface can safely do is move the decision to the person who owns it.
   She requests a revised order; the prescriber issues one; the new order arrives
   and the value she needs is now the value the order says. The guard never
   opens — the order moves.

   That is the difference between an override and an escalation, and it is the
   whole reason this path is worth designing rather than bolting on a button.

   ── 2. The urgent clinical escalation ──
   Separate control, separate colour, separate consequence. This is not about
   paperwork; it is "something is wrong with this patient now".

   It carries a confirmation step, which looks like friction and is not: a
   one-tap alarm that can fire from a pocket or a sleeve generates false alerts,
   and a channel that cries wolf is a channel clinicians learn to discount. One
   deliberate confirmation preserves the signal. */

export const ESCALATION = {
  orderChange: {
    id: 'order-change',
    label: 'Request order change',
    tone: 'attn',
    whenToUse: 'The entered value does not match the order, and the nurse believes the order itself needs to change.',
    steps: [
      { n: '01', actor: 'Nurse', text: 'Requests a revised order, with the reason and the value she believes is needed.' },
      { n: '02', actor: 'MedFlow', text: 'Sends the patient, the current order and the requested value to the prescriber.' },
      { n: '03', actor: 'Prescriber', text: 'Reviews and either issues a revised order or declines it.' },
      { n: '04', actor: 'MedFlow', text: 'Notifies the nurse of the outcome. If revised, the new order becomes the value the interface checks against.' },
      { n: '05', actor: 'Nurse', text: 'Configures against the revised order. The comparison passes because the order moved, not because the check was bypassed.' },
    ],
    principle:
      'The nurse never authorises her own departure from an order. The interface moves the decision to the person who owns it, and the discrepancy check is never switched off.',
  },

  urgent: {
    id: 'urgent',
    label: 'Alert clinician',
    tone: 'crit',
    whenToUse: 'Something is wrong with the patient and the responsible clinician is needed now.',
    confirmTitle: 'Alert the responsible clinician?',
    confirmBody:
      'This pages the clinician responsible for this patient immediately and records the alert against this patient.',
    confirmAction: 'Alert now',
    cancelAction: 'Cancel',
    sentTitle: 'Clinician alerted',
    sentBody: 'Paged. The alert is recorded against this patient with the current therapy state attached.',
    whyConfirm:
      'A single tap would be faster, and would also fire from a pocket, a sleeve, or a mis-grab while carrying something. False alerts train clinicians to discount the channel, so the design spends one deliberate confirmation to keep the signal meaningful.',
  },
};

/* ── The two people, in enough detail to design for ──────────────────────────
   A constructed persona, and labelled as one throughout. Scenario design of
   exactly this shape is normal practice in usability engineering — IEC 62366's
   use specification asks for intended users, uses and environments — so the
   form is domain-appropriate rather than decorative.

   THE LINE THIS DOES NOT CROSS: Maya has a constructed CONTEXT (recovering from
   planned surgery, prescribed a continuous infusion), not a diagnosis. Naming a
   condition and implying Med-A treats it would be fabricating clinical content,
   which is a different thing from constructing a scenario, and it is the thing
   this page must not do. */

export const PATIENT_PROFILE = {
  heading: 'Who Maya is',
  lines: [
    ['Age', '62'],
    ['Where she is', 'Room 412, post-operative ward'],
    ['Stage', 'Day 1 following planned surgery'],
    ['Why a pump', 'Prescribed a continuous IV infusion rather than a single injection, because the medication is intended to be delivered steadily over hours'],
    ['Mobility', 'In bed, attached to a pump on a stand — she moves with it, and the line moves with her'],
  ],
  note:
    'A constructed persona. Maya has a scenario context, not a diagnosis: this study has no basis to state what condition she has or what Med-A would treat.',
};

export const NURSE_PROFILE = {
  heading: 'Sarah’s shift',
  lines: [
    ['Caseload', 'Four patients assigned this shift'],
    ['This task', 'One of many — setting up Maya’s infusion is a few minutes inside a shift measured in hours'],
    ['Conditions', 'Interruptions, competing alarms, variable lighting, other patients calling'],
    ['What she brings', 'Clinical training and experience — she is an expert user, not a novice'],
    ['What she cannot bring', 'Uninterrupted attention. The design cannot assume it'],
  ],
  note:
    'This is why the interface is built around interruption and recovery rather than around an expert working undisturbed. Designing for a user’s best moment is designing for the moment errors do not happen in.',
};

/* How the two of them actually meet the product. The narrative spine that
   sections 06 through 10 then formalise. */
export const USE_NARRATIVE = [
  {
    n: '01',
    actor: 'Sarah',
    icon: 'checklist',
    text: 'Opens MedFlow at the start of her round and sees which of her four patients needs something done. Maya needs an infusion set up.',
  },
  {
    n: '02',
    actor: 'Sarah + Maya',
    icon: 'wristband',
    text: 'Goes to Room 412 and scans Maya’s wristband. The app confirms she is working with the right patient before it will let her go further.',
  },
  {
    n: '03',
    actor: 'Sarah',
    icon: 'vial',
    text: 'Reads the prescribed order — what was ordered, at what concentration, by whom — shown read-only so it cannot be edited by accident.',
  },
  {
    n: '04',
    actor: 'Sarah',
    icon: 'pump',
    text: 'Enters the rate and volume the pump should run at. This is the moment the study is built around, because it is the moment a digit can go wrong.',
  },
  {
    n: '05',
    actor: 'MedFlow',
    icon: 'diamond',
    text: 'Compares what she typed against the order. If they disagree it stops her, shows both numbers side by side, and does not offer a way past.',
  },
  {
    n: '06',
    actor: 'Sarah',
    icon: 'check',
    text: 'Corrects the value, reviews everything once more on a dedicated screen, and starts the infusion.',
  },
  {
    n: '07',
    actor: 'Maya',
    icon: 'clock',
    text: 'The infusion runs for hours. Sarah is elsewhere with other patients; the pump is what is watching.',
  },
  {
    n: '08',
    actor: 'MedFlow',
    icon: 'bell-alert',
    text: 'The line occludes. The app raises an alarm that says what happened, to which patient, and what state the therapy is now in.',
  },
];

/* ─── 04 · Human factors ───────────────────────────────────────────────────── */

export const HF_PILLARS = [
  {
    id: 'user',
    title: 'User',
    icon: 'user',
    blurb: 'Who is interacting, and what they bring to the interaction.',
    items: ['Clinical experience', 'Training', 'Attention', 'Memory', 'Perception', 'Physical interaction'],
  },
  {
    id: 'task',
    title: 'Task',
    icon: 'checklist',
    blurb: 'What has to be accomplished, broken into its real steps.',
    items: ['Patient identification', 'Order review', 'Numerical entry', 'Confirmation', 'Monitoring', 'Alarm response'],
  },
  {
    id: 'environment',
    title: 'Environment',
    icon: 'ward',
    blurb: 'The conditions the interaction actually happens under.',
    items: ['Interruptions', 'Time pressure', 'Multiple patients', 'Noise', 'Variable lighting', 'Competing information'],
  },
];

export const HF_CHAIN = [
  { label: 'User + Task + Environment', tone: 'neutral' },
  { label: 'Interaction', tone: 'neutral' },
  { label: 'Potential use error', tone: 'attn' },
  { label: 'Design response', tone: 'accent' },
  { label: 'Evaluation', tone: 'info' },
];

/* ─── 05 · User needs ──────────────────────────────────────────────────────── */

export const USER_NEEDS = [
  { id: 'UN-01', text: 'The nurse needs to identify which patient is associated with the active workflow.' },
  { id: 'UN-02', text: 'The nurse needs to distinguish prescribed information from manually entered information.' },
  { id: 'UN-03', text: 'The nurse needs to understand the units associated with numerical values.' },
  { id: 'UN-04', text: 'The nurse needs to review safety-critical settings before initiating the simulated infusion.' },
  { id: 'UN-05', text: 'The nurse needs to immediately understand whether the simulated infusion is running, paused, interrupted, or requires attention.' },
  { id: 'UN-06', text: 'The nurse needs to recognize high-priority system alerts without relying solely on color.' },
  { id: 'UN-07', text: 'The nurse needs a clear path to recover when an entered value conflicts with the simulated order.' },
  { id: 'UN-08', text: 'The nurse needs a route to question a simulated order she believes is wrong, without being able to authorise a departure from it herself.' },
  { id: 'UN-09', text: 'The nurse needs to reach the responsible clinician urgently from any screen, without that route being easy to trigger by accident.' },
  { id: 'UN-10', text: 'The nurse needs to know when the simulated infusion has finished, distinctly from it having been paused or interrupted.' },
];

/* ─── 06 · Workflow ────────────────────────────────────────────────────────── */

/* `critical` marks the interactions where a use error would carry the greatest
   consequence. It is the field that drives the diamond marker in section 06,
   the row ordering in section 07, and the task list in section 13 — one flag,
   three sections, no chance of them disagreeing. */
export const WORKFLOW = [
  { n: 1, label: 'Select assigned patient', critical: false, screen: 'dashboard' },
  { n: 2, label: 'Verify patient identity', critical: true, screen: 'verify' },
  { n: 3, label: 'Review medication order', critical: true, screen: 'order' },
  { n: 4, label: 'Configure infusion', critical: true, screen: 'configure' },
  { n: 5, label: 'Review entered settings', critical: false, screen: 'configure' },
  { n: 6, label: 'Resolve discrepancies', critical: true, screen: 'discrepancy' },
  { n: 7, label: 'Confirm final settings', critical: true, screen: 'confirm' },
  { n: 8, label: 'Start simulated infusion', critical: false, screen: 'confirm' },
  { n: 9, label: 'Monitor status', critical: false, screen: 'active' },
  { n: 10, label: 'Respond to alerts', critical: true, screen: 'alert' },
  { n: 11, label: 'Confirm completion', critical: false, screen: 'complete' },
];

export const TASK_ANALYSIS = [
  {
    task: 'Verify patient',
    goal: 'Ensure the correct patient context',
    issue: 'Wrong patient selected',
    response: 'Persistent identity + explicit verification step',
    need: 'UN-01',
  },
  {
    task: 'Review medication',
    goal: 'Understand what has been prescribed',
    issue: 'Prescribed values confused with editable values',
    response: 'Prescribed information styled as read-only, visually separated',
    need: 'UN-02',
  },
  {
    task: 'Enter configuration',
    goal: 'Set the infusion to the ordered parameters',
    issue: 'Digit entry error, or unit misread',
    response: 'Unit locked inside the field, order shown alongside',
    need: 'UN-03',
  },
  {
    task: 'Confirm settings',
    goal: 'Check the configuration before it takes effect',
    issue: 'Configuration accepted without adequate review',
    response: 'Dedicated review step immediately before initiation',
    need: 'UN-04',
  },
  {
    task: 'Monitor infusion',
    goal: 'Know the current state at a glance',
    issue: 'System state misread or assumed',
    response: 'Explicit state word, glyph and progress, always visible',
    need: 'UN-05',
  },
  {
    task: 'Respond to alert',
    goal: 'Recognise and act on an abnormal condition',
    issue: 'Critical alert overlooked',
    response: 'Icon + text + state + hierarchy, never colour alone',
    need: 'UN-06',
  },
];

/* ─── 07 · Illustrative use-related risk analysis ──────────────────────────────
   NOT a UFMEA. Not a regulatory risk assessment. A conceptual exercise showing
   how a potential use error can drive an interface decision — which is why the
   `response` column is the one that is emphasised in the layout, and why every
   row carries the user need and the screen it resolves to. */
export const RISKS = [
  {
    id: 'R-01',
    error: 'Wrong patient selected',
    outcome: 'Workflow performed in incorrect patient context',
    factor: 'Patient identity insufficiently prominent',
    response: 'Explicit patient verification + persistent patient identity',
    need: 'UN-01',
    screen: 'verify',
  },
  {
    id: 'R-02',
    error: 'Incorrect numerical entry',
    outcome: 'Incorrect simulated infusion configuration',
    factor: 'Digit entry error, or unclear comparison with the order',
    response: 'Visible units + order comparison + blocking discrepancy state',
    need: 'UN-03',
    screen: 'discrepancy',
  },
  {
    id: 'R-03',
    error: 'Configuration accepted without adequate review',
    outcome: 'Incorrect settings progress into simulated therapy',
    factor: 'Confirmation step lacks sufficient information',
    response: 'Dedicated review screen immediately before initiation',
    need: 'UN-04',
    screen: 'confirm',
  },
  {
    id: 'R-04',
    error: 'Critical alert overlooked',
    outcome: 'Delayed response to interrupted simulated infusion',
    factor: 'Weak hierarchy, or reliance on colour',
    response: 'Prominent alert state + text/icon redundancy + explicit system status',
    need: 'UN-06',
    screen: 'alert',
  },
  {
    id: 'R-05',
    error: 'User loses patient context',
    outcome: 'Confusion while moving between workflows',
    factor: 'Identity disappears between screens',
    response: 'Persistent patient context on safety-significant screens',
    need: 'UN-01',
    screen: 'active',
  },
  {
    id: 'R-06',
    error: 'User works around a block she believes is wrong',
    outcome: 'The guard is defeated, or the therapy is delayed while she looks for another route',
    factor: 'Blocking state offers correction as its only exit, with no way to question the order',
    response: 'Escalation path that requests a revised order from the prescriber — never a self-authorised override',
    need: 'UN-08',
    screen: 'discrepancy',
  },
  {
    id: 'R-07',
    error: 'Completed infusion read as paused or stalled',
    outcome: 'Unnecessary intervention, or a finished therapy left unacknowledged',
    factor: 'Completion shares a look with the other non-delivering states',
    response: 'Completion given its own state, glyph and delivery summary',
    need: 'UN-10',
    screen: 'complete',
  },
];

/* ─── 08 · Wireframes ──────────────────────────────────────────────────────── */

export const WIREFRAMES = [
  { id: 'dashboard', title: 'Patient dashboard', note: 'Make the patient requiring action scannable first.' },
  { id: 'verify', title: 'Patient verification', note: 'Keep patient identity persistent.' },
  { id: 'order', title: 'Medication order', note: 'Separate prescribed from editable.' },
  { id: 'configure', title: 'Infusion setup', note: 'Associate units directly with numeric input.' },
  { id: 'confirm', title: 'Final review', note: 'Separate configuration from final confirmation.' },
  { id: 'active', title: 'Active infusion', note: 'Make system state immediately visible.' },
  { id: 'alert', title: 'Alert state', note: 'Do not rely solely on colour for alerts.' },
  { id: 'complete', title: 'Infusion complete', note: 'Finished must not look like paused.' },
];

/* ─── 09 · Screens ─────────────────────────────────────────────────────────────
   Order matters: this array drives section 09's sequence AND the prototype's
   step order in section 10, so the two can never drift out of sync. */
export const SCREENS = [
  {
    id: 'dashboard',
    n: '01',
    title: 'Clinical dashboard',
    rationale: 'Make patient identity and required action scannable without overwhelming the user.',
    need: null,
  },
  {
    id: 'verify',
    n: '02',
    title: 'Patient verification',
    rationale: 'Introduce explicit identity verification before entering the safety-significant workflow.',
    need: 'UN-01',
  },
  {
    id: 'order',
    n: '03',
    title: 'Medication order',
    rationale: 'Separate prescribed information visually from editable configuration.',
    need: 'UN-02',
  },
  {
    id: 'configure',
    n: '04',
    title: 'Configure infusion',
    rationale: 'Reduce ambiguity around numerical values and their associated units.',
    need: 'UN-03',
  },
  {
    id: 'discrepancy',
    n: '05',
    title: 'Discrepancy / safety intervention',
    rationale:
      'Do not depend solely on the user noticing their own numerical error. Interrupt progression and explain the discrepancy in terms of the order.',
    need: 'UN-07',
    emphasis: true,
  },
  {
    id: 'confirm',
    n: '06',
    title: 'Final confirmation',
    rationale: 'Provide a final opportunity to detect configuration errors immediately before a safety-significant action.',
    need: 'UN-04',
  },
  {
    id: 'active',
    n: '07',
    title: 'Active infusion',
    rationale: 'Prioritise patient, therapy, rate and system status so the interface can be understood quickly.',
    need: 'UN-05',
  },
  {
    id: 'alert',
    n: '08',
    title: 'Alert state',
    rationale:
      'Communicate what happened, which patient and therapy are affected, and the current system state without relying exclusively on colour.',
    need: 'UN-06',
  },
  {
    id: 'complete',
    n: '09',
    title: 'Infusion complete',
    rationale:
      'Finished is not the same as paused or interrupted, and an interface that lets those three share a look invites the wrong response. Completion gets its own state, its own glyph, and a summary of what was actually delivered.',
    need: 'UN-10',
  },
];

/* Other patients on the dashboard. Present so the dashboard has to solve a real
   scanning problem rather than showing a single card. Reduced visual priority
   in the UI — they are context, not the task. */
export const WARD = [
  /* Each of these needs its OWN glyph, and two of them were wrong.
     Both sat on `off`, which draws a pause bar — so the dashboard said a
     finished infusion was paused, and said a patient with nothing prescribed
     was paused too. Section 09 argues in writing that finished must not look
     like paused, and the dashboard was quietly contradicting it three cards
     down. A pause bar is a claim: something was running and was stopped. */
  { initials: 'JR', name: 'James Ruiz', room: 'Room 408', state: 'Infusion running', tone: 'run' },
  /* Nothing was ever running, so nothing is paused. A neutral dot, not a bar. */
  { initials: 'AO', name: 'Amara Osei', room: 'Room 410', state: 'No active orders', tone: 'off', shape: 'dot' },
  /* Ran to term. Its own tier, with the tick — the same one the completion
     screen uses, because they are reporting the same thing. */
  { initials: 'TL', name: 'Tomas Lind', room: 'Room 415', state: 'Infusion complete', tone: 'done' },
];

/* ─── 11 · Design system ───────────────────────────────────────────────────── */

export const TYPE_SCALE = [
  { name: 'Display', size: '44px / 600', use: 'Critical values only', sample: '5 mL/hr' },
  { name: 'Heading', size: '20px / 600', use: 'Screen titles', sample: 'Review before starting' },
  { name: 'Body', size: '15px / 400', use: 'Instructions and descriptions', sample: 'Check the infusion line and patient.' },
  { name: 'Label', size: '10.5px / 600', use: 'Field and column names', sample: 'INFUSION RATE' },
  { name: 'Critical value', size: '22px / 600', use: 'Editable numeric entry', sample: '100 mL' },
];

/* Button states are not listed here: each specimen in section 11 needs its own
   variant class and label, so driving them from an array of strings would mean
   a lookup table that is longer than the four elements it generates. They are
   written out directly in DesignSystem. */
export const INPUT_STATES = ['Default', 'Focused', 'Matches order', 'Error', 'Disabled'];
export const ALERT_TIERS = [
  { tone: 'info', label: 'Informational', body: 'Context the user may want. Never interrupts a task.' },
  { tone: 'attn', label: 'Warning', body: 'Something needs attention before proceeding.' },
  { tone: 'crit', label: 'Critical', body: 'Therapy state has changed. Requires acknowledgement.' },
];
export const STATUS_TIERS = [
  { tone: 'run', label: 'Running', shape: 'play' },
  { tone: 'off', label: 'Paused', shape: 'pause' },
  /* Complete is a SEPARATE tier from paused. Both are "not currently
     delivering", and treating them as one look is how a finished infusion gets
     mistaken for a stalled one — the response to those two is not the same. */
  { tone: 'done', label: 'Complete', shape: 'check' },
  { tone: 'attn', label: 'Requires attention', shape: 'triangle' },
  { tone: 'crit', label: 'Interrupted', shape: 'octagon' },
];
export const COMPONENTS = [
  'Patient card',
  'Medication card',
  'Input field',
  'Confirmation panel',
  'Alert banner',
  'Navigation',
  'Status indicator',
];

/* ─── 12 · Accessibility ───────────────────────────────────────────────────── */

export const A11Y = [
  { title: 'State is never colour alone', body: 'Every status carries a word and a glyph before colour is counted. The page survives greyscale printing and colour vision deficiency.' },
  { title: 'Contrast measured against the tint', body: 'Ratios are checked against the surface a value actually sits on, not the page behind it. A 10% tint is enough to drop a colour below 4.5:1.' },
  { title: 'Readable type sizes', body: 'Nothing on a screen is below 10.5px, and that floor is reserved for uppercase labels with wide tracking.' },
  { title: 'Interaction targets at 44px', body: 'Every control clears 44×44px — the working assumption is a tablet, held at arm’s length, possibly with gloves.' },
  { title: 'Units stay attached to values', body: 'A number and its unit are one typographic object. Neither a layout boundary nor a column header separates them.' },
  { title: 'Plain, direct terminology', body: 'The interface says “Infusion interrupted”, not “Therapy anomaly detected”.' },
  { title: 'Critical information persists', body: 'Patient identity remains on screen for the whole safety-significant workflow rather than appearing once at the start.' },
  { title: 'Low memory demand', body: 'The ordered value is shown next to the entered value at the moment of comparison, so nothing has to be carried between screens.' },
  { title: 'Editable and prescribed look different', body: 'The distinction is structural — bordered field versus tinted read-only block — not merely a colour difference.' },
  { title: 'System state is confirmed after action', body: 'Every action that changes therapy state is followed by an explicit statement of the new state.' },
];

/* ─── 13 · Proposed formative study ────────────────────────────────────────── */

export const STUDY_TASKS = [
  'Identify Maya Patel',
  'Verify patient identity',
  'Review the simulated order',
  'Configure the infusion',
  'Respond to the introduced configuration discrepancy',
  'Correct the configuration',
  'Review and initiate the simulated infusion',
  'Interpret the active-infusion state',
  'Respond to the simulated alert',
];

export const OBSERVATIONS = [
  'Task completion',
  'Use errors',
  'Close calls',
  'Hesitation and confusion',
  'Assistance required',
  'Navigation errors',
  'Interpretation of warnings',
  'Ability to recover from errors',
  'Qualitative comments',
];

export const STUDY_LOOP = ['Test', 'Observe', 'Identify issue', 'Analyze contributing factors', 'Redesign', 'Retest'];

/* ─── 14 · Iteration ───────────────────────────────────────────────────────── */

export const ITERATION = [
  {
    concern: 'Patient context may be overlooked',
    v1: 'Patient name shown only in the header.',
    v2: 'Persistent patient identity on every safety-significant screen.',
    need: 'UN-01',
  },
  {
    concern: 'Unit may be misread',
    v1: 'Rate entry displayed as “5” with the unit in a separate column.',
    v2: 'Rate shown consistently as “5 mL/hr”, unit locked inside the field.',
    need: 'UN-03',
  },
  {
    concern: 'Configuration may be confirmed too quickly',
    v1: 'Confirmation button immediately available on the configuration screen.',
    v2: 'Dedicated review stage between configuration and initiation.',
    need: 'UN-04',
  },
  {
    concern: 'Alert recognition depends too heavily on colour',
    v1: 'Alert communicated mostly through a red background.',
    v2: 'Icon + text + explicit state + hierarchy, with colour as the fourth signal.',
    need: 'UN-06',
  },
];

/* ─── 15 · Cross-functional ────────────────────────────────────────────────── */

export const FUNCTIONS = [
  { id: 'product', name: 'Product', body: 'Defines product goals and requirements.', icon: 'target' },
  { id: 'ux', name: 'UX / UI', body: 'Translates user needs and workflows into interface solutions.', icon: 'layers', self: true },
  { id: 'hfe', name: 'Human Factors', body: 'Evaluates users, tasks, use environments and use-related risks.', icon: 'person-study' },
  { id: 'eng', name: 'Engineering', body: 'Evaluates technical feasibility and implements behaviour.', icon: 'code' },
  { id: 'quality', name: 'Quality', body: 'Ensures design and process documentation aligns with quality systems.', icon: 'clipboard-check' },
  { id: 'reg', name: 'Regulatory', body: 'Evaluates regulatory requirements and submission implications.', icon: 'certificate' },
];

/* ─── 16 · Traceability ────────────────────────────────────────────────────── */

export const TRACE = [
  { stage: 'User need', ref: 'UN-04', body: 'The nurse needs to review safety-critical settings before initiating the simulated infusion.', tone: 'neutral' },
  { stage: 'Potential use issue', ref: 'R-03', body: 'Configuration error progresses unnoticed into simulated therapy.', tone: 'attn' },
  { stage: 'Design requirement', ref: 'DR-04', body: 'Provide a dedicated review step displaying patient, medication, rate and volume before initiation.', tone: 'accent' },
  { stage: 'Interface', ref: 'Screen 06', body: 'Final confirmation screen, positioned between configuration and initiation.', tone: 'accent' },
  { stage: 'Evaluation', ref: 'T-07', body: 'Proposed formative task evaluating whether users review and correctly interpret configuration before proceeding.', tone: 'info' },
];

/* ─── 17 · Frameworks ──────────────────────────────────────────────────────── */

export const FRAMEWORKS = [
  {
    name: 'IEC 62366-1',
    body: 'Introduced me to the structured application of usability engineering to medical devices, particularly the relationship between user interface characteristics and use-related safety.',
  },
  {
    name: 'IEC/TR 62366-2',
    body: 'Provides additional guidance and context for applying usability engineering concepts to medical devices.',
  },
  {
    name: 'FDA Human Factors guidance',
    body: 'Reinforced the importance of intended users, use environments, critical tasks, use-related risk analysis, and evaluation with representative users.',
  },
];

export const FRAMEWORK_CAVEAT =
  'These frameworks informed my learning and design reasoning. MedFlow has not undergone the processes necessary to claim compliance with IEC 62366 or FDA requirements.';

/* ─── 19 · Capabilities ────────────────────────────────────────────────────── */

export const CAPABILITIES = [
  { title: 'User-centered interface design', body: 'Figma-driven interface and workflow design', section: 'final-interface' },
  { title: 'Task analysis', body: 'Safety-significant workflow decomposition', section: 'workflow' },
  { title: 'Human Factors', body: 'User, task and environment considerations', section: 'human-factors' },
  { title: 'Use-related risk thinking', body: 'Potential errors connected to design responses', section: 'risk' },
  { title: 'Wireframing and prototyping', body: 'Low-fi to high-fi to interactive flow', section: 'wireframes' },
  { title: 'Design systems', body: 'Reusable components and consistent states', section: 'design-system' },
  { title: 'Usability evaluation', body: 'Proposed formative testing methodology', section: 'proposed-study' },
  { title: 'Iterative design', body: 'Finding, redesign, retest model', section: 'iteration' },
  { title: 'Cross-functional thinking', body: 'Product, HFE, Engineering, Quality, Regulatory', section: 'cross-functional' },
  { title: 'Documentation', body: 'User need to design requirement to interface to evaluation', section: 'traceability' },
];

/* ─── Section index ────────────────────────────────────────────────────────────
   Drives the sticky index, the scroll spy and the skip target. Ids here MUST
   match the id on each <section>; index.jsx asserts this in development. */
export const SECTIONS = [
  { id: 'hero', n: '01', name: 'MedFlow' },
  { id: 'why', n: '02', name: 'Why this study' },
  { id: 'scenario', n: '03', name: 'The scenario' },
  { id: 'human-factors', n: '04', name: 'Designing around the human' },
  { id: 'user-needs', n: '05', name: 'User needs' },
  { id: 'workflow', n: '06', name: 'Workflow analysis' },
  { id: 'risk', n: '07', name: 'Use-related risk' },
  { id: 'wireframes', n: '08', name: 'Wireframes' },
  { id: 'final-interface', n: '09', name: 'The interface' },
  { id: 'prototype', n: '10', name: 'Prototype' },
  { id: 'design-system', n: '11', name: 'Design system' },
  { id: 'accessibility', n: '12', name: 'Accessibility' },
  { id: 'proposed-study', n: '13', name: 'How I would test it' },
  { id: 'iteration', n: '14', name: 'Iteration' },
  { id: 'cross-functional', n: '15', name: 'Cross-functional' },
  { id: 'traceability', n: '16', name: 'Traceability' },
  { id: 'frameworks', n: '17', name: 'Frameworks' },
  { id: 'learned', n: '18', name: 'What changed' },
  { id: 'capabilities', n: '19', name: 'Capabilities' },
  { id: 'closing', n: '20', name: 'Closing' },
];
