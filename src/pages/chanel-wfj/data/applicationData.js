/* ─── Application study data ─────────────────────────────────────────────────
   Every operational figure on this page is ILLUSTRATIVE. Nothing here is drawn
   from CHANEL systems, client records or internal documents — the page is an
   independent study built from the public job posting, and the data exists only
   to demonstrate how the work would be structured.

   It lives in one module rather than inside the JSX so the numbers stay
   internally consistent: the recap section derives its rates from the funnel
   below, so a change to one figure cannot silently contradict another.

   The only non-fictional content on the page is EVIDENCE, at the bottom of this
   file — those are verified facts from Akshathdayan Suresh's actual roles, and
   nothing may be added to them. */

/* ── Status vocabulary ──────────────────────────────────────────────────────
   Status is never carried by colour alone. Every state pairs a glyph with a
   written label, so the readiness view is legible in greyscale, to a screen
   reader, and to anyone with a colour vision deficiency.

   Green is reserved for genuine positive status — Ready and On track — and
   appears nowhere else on the page. */
export const STATUS = {
  ready:      { label: 'Ready',          shape: 'square',   tone: 'go' },
  onTrack:    { label: 'On track',       shape: 'diamond',  tone: 'go' },
  inProgress: { label: 'In progress',    shape: 'half',     tone: 'warm' },
  scheduled:  { label: 'Scheduled',      shape: 'circle',   tone: 'neutral' },
  awaiting:   { label: 'Awaiting input', shape: 'triangle', tone: 'attention' },
};

/* ── Timeline ───────────────────────────────────────────────────────────────
   Six calibration points. The en-dash in the short label is deliberate: a
   hyphen at this letter-spacing reads as a stray tick mark. */
export const TIMELINE = [
  { id: 't8',     short: 'T–8',    full: 'T-8 weeks' },
  { id: 't6',     short: 'T–6',    full: 'T-6 weeks' },
  { id: 't4',     short: 'T–4',    full: 'T-4 weeks' },
  { id: 't2',     short: 'T–2',    full: 'T-2 weeks' },
  { id: 'launch', short: 'LAUNCH', full: 'Launch' },
  { id: 'plus2',  short: 'T+2',    full: 'T+2 days' },
];

/* ── Six workstreams ────────────────────────────────────────────────────────
   span is [startIndex, endIndex] into TIMELINE — the window during which the
   workstream is actively worked, not the whole period it is tracked. */
export const WORKSTREAMS = [
  {
    id: 'product',
    icon: 'assets',
    num: '01',
    name: 'Product & asset readiness',
    span: [0, 2],
    status: 'ready',
    owner: 'Marketing Manager — WFJ',
    coordinator: 'Assets logged and circulated by coordinator',
    nextAction: 'Distribute final asset pack to VM and boutique leads',
    dependency: 'Global asset drop received at T-8',
    due: 'T-4 weeks',
    note: 'Locks first. Every other workstream quotes from it.',
  },
  {
    id: 'crm',
    icon: 'target',
    num: '02',
    name: 'Client targeting & CRM',
    span: [1, 3],
    status: 'onTrack',
    owner: 'CRM Manager',
    coordinator: 'Segment counts consolidated weekly by coordinator',
    nextAction: 'Confirm final segment counts with boutique directors',
    dependency: 'Product pack locked at T-4',
    due: 'T-2 weeks',
    note: 'Agreed with each boutique, not issued to them.',
  },
  {
    id: 'invitations',
    icon: 'invitation',
    num: '03',
    name: 'Invitations & RSVP tracking',
    span: [2, 4],
    status: 'inProgress',
    owner: 'Coordinator — WFJ',
    coordinator: 'Owned end to end by coordinator',
    nextAction: 'Second-wave follow-up on 24 unanswered invitations',
    dependency: 'Final client list signed off at T-2',
    due: 'Launch',
    note: 'One tracker. Refreshed daily in the final fortnight.',
  },
  {
    id: 'retail',
    icon: 'briefing',
    num: '04',
    name: 'Retail briefing & training',
    span: [2, 4],
    status: 'onTrack',
    owner: 'Retail Manager',
    coordinator: 'Briefing drafted by coordinator for Manager review',
    nextAction: 'Circulate boutique reminder and confirm training completion',
    dependency: 'Product pack + confirmed guest list',
    due: 'T-2 weeks',
    note: 'The briefing lands before the invitation does.',
  },
  {
    id: 'vm',
    icon: 'case',
    num: '05',
    name: 'VM, samples & vendor follow-up',
    span: [1, 4],
    status: 'awaiting',
    owner: 'VM Lead + Operations',
    coordinator: 'PO and sample movement tracked by coordinator',
    nextAction: 'Chase outstanding vendor PO before install window closes',
    dependency: 'Vendor confirmation outstanding — escalate at T-2',
    due: 'T-2 weeks',
    note: 'The only open dependency. Flagged at T-8, not discovered at T-1.',
  },
  {
    id: 'reporting',
    icon: 'reporting',
    num: '06',
    name: 'Post-activation reporting',
    span: [4, 5],
    status: 'scheduled',
    owner: 'Coordinator — WFJ',
    coordinator: 'Compiled and issued by coordinator',
    nextAction: 'Issue recap to Director and global within 48 hours',
    dependency: 'Attendance and follow-up data closed out',
    due: 'T+2 days',
    note: 'Template already exists. Fill in numbers, not memory.',
  },
];

/* ── Client activation ──────────────────────────────────────────────────────
   Anonymised throughout. No real client, boutique or advisor is represented.
   The funnel drives the recap section, so these five figures are the single
   source for every rate quoted later on the page. */
export const FUNNEL = [
  { id: 'targeted',  label: 'Targeted',           value: 420 },
  { id: 'invited',   label: 'Invited',            value: 180 },
  { id: 'confirmed', label: 'Confirmed',          value: 96 },
  { id: 'attended',  label: 'Attended',           value: 74 },
  { id: 'followed',  label: 'Follow-up complete', value: 74 },
];

export const CLIENTS = [
  { id: 'Client 001', segment: 'Segment A', boutique: 'Boutique 1', invitation: 'Sent', rsvp: 'Confirmed', gifting: 'Allocated', attended: 'Yes', followUp: 'Complete' },
  { id: 'Client 002', segment: 'Segment A', boutique: 'Boutique 1', invitation: 'Sent', rsvp: 'Confirmed', gifting: 'Allocated', attended: 'Yes', followUp: 'Complete' },
  { id: 'Client 003', segment: 'Segment B', boutique: 'Boutique 2', invitation: 'Sent', rsvp: 'Declined',  gifting: 'Released',  attended: 'No',  followUp: 'Complete' },
  { id: 'Client 004', segment: 'Segment A', boutique: 'Boutique 2', invitation: 'Sent', rsvp: 'Confirmed', gifting: 'Allocated', attended: 'No',  followUp: 'Complete' },
  { id: 'Client 005', segment: 'Segment C', boutique: 'Boutique 3', invitation: 'Sent', rsvp: 'Awaiting',  gifting: 'On hold',   attended: '—',   followUp: 'Scheduled' },
  { id: 'Client 006', segment: 'Segment B', boutique: 'Boutique 3', invitation: 'Sent', rsvp: 'Confirmed', gifting: 'Allocated', attended: 'Yes', followUp: 'Complete' },
];

/* Client 004 confirmed then did not attend — the case that matters most, because
   it is the one a tracker usually loses. It is carried through to follow-up
   rather than dropped. */
export const ACTIVATION_NOTE =
  'A confirmed client who does not attend is the record most often lost. Here it stays open.';

/* ── Retail readiness documents ─────────────────────────────────────────────
   Three miniature operational documents. Built as real HTML rather than images
   so they are selectable, searchable, translatable and screen-reader legible. */
export const DOCUMENTS = [
  {
    id: 'reminder',
    icon: 'pin',
    kind: 'Boutique reminder',
    ref: 'WFJ / RTL / 014',
    title: 'High-end launch — boutique reminder',
    fields: [
      { label: 'Objective',  value: 'Every advisor can describe piece, price and appointment route before the first client asks.' },
      { label: 'Key date',   value: 'Issued T-2 weeks · in force from launch' },
      { label: 'Required',   value: 'Read, confirm receipt, raise gaps in the WFJ Teams channel' },
      { label: 'Owner',      value: 'Retail Manager' },
      { label: 'Dependency', value: 'Final product pack and pricing' },
      { label: 'Escalation', value: 'WFJ Director if unconfirmed at T-1 week' },
    ],
    status: 'ready',
  },
  {
    id: 'brief',
    icon: 'page',
    kind: 'Event brief',
    ref: 'WFJ / EVT / 007',
    title: 'End-of-year client activation — event brief',
    fields: [
      { label: 'Objective',  value: 'Arrival, hosting, gifting and follow-up — answered without a second conversation.' },
      { label: 'Key date',   value: 'Circulated T-2 weeks · final version T-4 days' },
      { label: 'Required',   value: 'Confirm hosting assignments and gifting allocation per guest' },
      { label: 'Owner',      value: 'Coordinator — drafted for Marketing Manager review' },
      { label: 'Dependency', value: 'Confirmed RSVP list at T-1 week' },
      { label: 'Escalation', value: 'Marketing Manager on any unassigned high-end guest' },
    ],
    status: 'inProgress',
  },
  {
    id: 'vm',
    icon: 'check',
    kind: 'Checklist',
    ref: 'WFJ / VM / 021',
    title: 'VM and training readiness checklist',
    fields: [
      { label: 'Objective',  value: 'Visually and operationally ready before the first invited client arrives.' },
      { label: 'Key date',   value: 'Install window T-1 week · sign-off T-2 days' },
      { label: 'Required',   value: 'Install sign-off, sample reconciliation, training completion logged' },
      { label: 'Owner',      value: 'VM Lead' },
      { label: 'Dependency', value: 'Vendor PO confirmation — currently outstanding' },
      { label: 'Escalation', value: 'Operations if install slips past T-4 days' },
    ],
    status: 'awaiting',
  },
];

export const RETAIL_STATEMENT =
  'What is happening. What is required. When it must be complete.';

/* ── Post-activation recap ──────────────────────────────────────────────────
   Rates are computed from FUNNEL rather than written by hand, so the recap can
   never drift out of step with the numbers shown in the section above it. */
const byId = (id) => FUNNEL.find((f) => f.id === id).value;
const pct = (a, b) => Math.round((byId(a) / byId(b)) * 100);

export const RECAP_METRICS = [
  { id: 'rsvp',      value: pct('confirmed', 'invited'), suffix: '%', label: 'RSVP conversion',    detail: `${byId('confirmed')} confirmed of ${byId('invited')} invited` },
  { id: 'attend',    value: pct('attended', 'confirmed'), suffix: '%', label: 'Attendance',        detail: `${byId('attended')} attended of ${byId('confirmed')} confirmed` },
  { id: 'followUp',  value: pct('followed', 'attended'),  suffix: '%', label: 'Follow-up closed',  detail: 'Every attending client contacted within 5 days' },
  { id: 'reporting', value: 48,                           suffix: 'h', label: 'Recap issued',      detail: 'Director and global, within the reporting window' },
];

export const RECAP_QUALITATIVE = [
  { label: 'Engagement',        value: 'Two highest-value references drove appointment requests within the week.' },
  { label: 'Boutique feedback', value: 'Arrived early enough to be useful. Wants a one-page version at T-1.' },
  { label: 'Reporting',         value: 'Issued in 48 hours. Vendor delay documented, not absorbed.' },
];

export const RECAP_NEXT = [
  'Move the vendor gate from T-2 to T-4.',
  'Add a one-page boutique summary at T-1.',
  'Carry the four non-attending confirmees into the next list.',
];

/* ── Evidence ───────────────────────────────────────────────────────────────
   VERIFIED FACTS ONLY. Nothing in this block may be embellished or added to.

   `link`   names the competency in the posting that the experience answers.
   `metric` promotes a figure that ALREADY APPEARS in that role's own points to
            display scale. No value here is new, rounded or restated — the
            sentence it came from stays in the list below it, so the claim can
            always be read in full context. */
export const EVIDENCE = [
  {
    id: 'd2l',
    num: '01',
    metric: { value: '30', suffix: '%', label: 'Event costs reduced' },
    org: 'D2L',
    role: 'Global event coordination',
    link: 'Coordination',
    points: [
      'Coordinated concurrent in-person, virtual and hybrid trade shows across North America, Europe and Asia',
      'Maintained shared trackers and timelines',
      'Prepared event briefs, internal communications, meeting notes and post-event recaps',
      'Used Power BI and Salesforce for reporting and client segmentation',
      'Led a supplier transition that reduced event costs by 30%',
    ],
  },
  {
    id: 'nespresso',
    num: '02',
    metric: { value: '8', suffix: '%', label: 'Increase in sales' },
    org: 'Nestlé Nespresso',
    role: 'Premium client experience',
    link: 'Client experience',
    points: [
      'Delivered personalized client consultations and live product demonstrations',
      'Maintained brand-aligned visual merchandising',
      'Contributed to an 8% increase in sales',
    ],
  },
  {
    id: 'footlocker',
    num: '03',
    metric: { value: '2,500', prefix: '$', suffix: '+', label: 'Weekly sales generated' },
    org: 'Foot Locker',
    role: 'Retail execution',
    link: 'Retail execution',
    points: [
      'Generate $2,500+ in weekly sales',
      'Coordinate product availability and inventory updates',
      'Maintain responsive service during high-volume retail periods',
    ],
  },
  {
    id: 'ubc',
    num: '04',
    metric: { value: '3', suffix: '', label: 'Campus events delivered' },
    org: 'UBC Marketing Club',
    role: 'Activation leadership',
    link: 'Activation leadership',
    points: [
      'Secured and activated sponsorships with RBC and Red Bull',
      'Delivered three campus events',
      'Managed budgets, timelines and deliverables across a four-person team',
    ],
  },
];

export const DISCLAIMER =
  'Independent application study created from publicly available information. All operational data shown is illustrative. Not commissioned by or affiliated with CHANEL.';

export const RESUME_HREF = '/Akshathdayan_Suresh_Resume_CHANEL_WFJ.pdf';
export const RESUME_FILENAME = 'Akshathdayan_Suresh_Resume_CHANEL_WFJ.pdf';
export const PORTFOLIO_URL = 'https://www.akshathdayansuresh.com/';
export const CONTACT_EMAIL = 'akshath4000@gmail.com';
