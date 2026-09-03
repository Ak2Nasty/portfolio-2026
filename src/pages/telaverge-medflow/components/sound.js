/* ─── Auditory signals ───────────────────────────────────────────────────────
   Conceptual audible cues for the prototype. Synthesised in the browser with
   the Web Audio API, so there are no audio assets to load and every cue is
   defined by its parameters rather than by a file somebody exported once.

   ══ WHAT THIS IS NOT ═══════════════════════════════════════════════════════
   THESE ARE NOT COMPLIANT ALARM SIGNALS, and they could not be. Alarm signals
   for medical electrical equipment are the subject of IEC 60601-1-8 — not
   IEC 62366, which is usability engineering — and that standard specifies
   things a web page cannot satisfy or verify:

     · sound pressure level measured at a stated distance from the device
     · the actual acoustic output of the hardware it is played through
     · fundamental frequency, harmonic content and pulse characteristics
       verified on that hardware
     · behaviour under the alarm-limit, alarm-off and audio-paused states
     · integration with a distributed alarm system

   The volume here is whatever the reader's device is set to, through speakers
   nobody specified, in a room nobody characterised. That is the opposite of a
   measured alarm signal. Nothing on this page has been tested against any
   standard, and an audible cue in a portfolio prototype cannot be.

   ══ WHAT IT IS ════════════════════════════════════════════════════════════
   A demonstration that the AUDITORY channel was designed rather than left to a
   default beep, using the same reasoning the visual work uses:

   1. SOUND IS NEVER THE ONLY SIGNAL. Every cue here accompanies a state that is
      already carried by a word, a glyph, a position and a colour. Turn the
      sound off and nothing is lost — which is the test, because in a real ward
      the volume may be down, the room may be loud, and the user may be deaf or
      hard of hearing. Audio that carries information nothing else carries is a
      single point of failure with a volume knob on it.

   2. PRIORITY IS ENCODED IN STRUCTURE, NOT LOUDNESS. Turning the same beep up
      does not make it more urgent, it makes it more annoying. Higher-priority
      cues use more pulses in a recognisable burst pattern and a wider melodic
      interval; lower-priority ones are shorter, quieter and flatter. The
      burst-count convention — a longer repeated burst for the most urgent
      condition, a short single burst for a caution — follows the shape used in
      alarm-signal design, which is where the idea comes from and as far as the
      resemblance goes.

   3. ALARMS AND CONFIRMATIONS ARE DIFFERENT FAMILIES. Alarms fall; completions
      rise. A confirmation that sounds like an alarm teaches people to ignore
      alarms, which is the failure mode audible alerting has to design against
      before anything else.

   4. IT IS OFF UNTIL ASKED FOR. A case-study page that plays an infusion alarm
      at whatever volume the reader's laptop happens to be at is hostile, and
      browsers rightly refuse to start audio before a gesture anyway. The reader
      turns it on deliberately, and can turn it off at any time from the same
      control.

   5. NOTHING IS GATED BEHIND IT. No cue is required to complete any task in the
      prototype, and no state is announced only by sound. */

/* One context for the page, created on the first deliberate enable rather than
   at import: constructing an AudioContext before a user gesture leaves it
   suspended in most browsers, and a suspended context that nobody resumes is a
   silent bug that only shows up on someone else's machine. */
let ctx = null;
let enabled = false;
const listeners = new Set();

function context() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function isSoundEnabled() {
  return enabled;
}

export function setSoundEnabled(next) {
  enabled = next;
  if (next) context();
  listeners.forEach((fn) => fn(enabled));
}

export function subscribeSound(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ── The cue vocabulary ──────────────────────────────────────────────────────
   `pulses`  how many tones in a burst
   `bursts`  how many times the burst repeats — this is the priority signal
   `notes`   the melodic contour, in Hz. Falling for problems, rising for
             completions, flat for acknowledgements.
   `dur`     length of each pulse
   `gap`     silence between pulses
   `rest`    silence between bursts
   `gain`    peak amplitude. Deliberately modest across the board: none of these
             is loud, because loudness is not what carries the priority.
   `type`    oscillator waveform. Triangle for alarms — more harmonic content,
             so it cuts through — sine for everything else. */
const CUES = {
  /* Occlusion. The most urgent thing this device can say, so it is the longest
     pattern: two bursts of five falling tones, then silence. */
  alarm: {
    pulses: 5, bursts: 2, notes: [988, 880, 784, 698, 622],
    dur: 0.11, gap: 0.07, rest: 0.34, gain: 0.14, type: 'triangle',
  },
  /* Progression blocked at the discrepancy. Serious, not an emergency: one
     burst of three, falling. */
  block: {
    pulses: 3, bursts: 1, notes: [784, 660, 554],
    dur: 0.13, gap: 0.08, rest: 0, gain: 0.12, type: 'triangle',
  },
  /* The nurse has stopped delivery deliberately. Two flat low tones — a state
     change worth hearing, not a fault. */
  pause: {
    pulses: 2, bursts: 1, notes: [392, 392],
    dur: 0.12, gap: 0.09, rest: 0, gain: 0.08, type: 'sine',
  },
  /* Identity verified, rate matched, infusion resumed. Rising, brief. */
  confirm: {
    pulses: 2, bursts: 1, notes: [587, 784],
    dur: 0.09, gap: 0.05, rest: 0, gain: 0.08, type: 'sine',
  },
  /* Therapy started. One step further up than a confirmation, because it is a
     safety-significant action rather than a check passing. */
  start: {
    pulses: 3, bursts: 1, notes: [523, 659, 784],
    dur: 0.1, gap: 0.05, rest: 0, gain: 0.09, type: 'sine',
  },
  /* Infusion complete. The only cue that resolves upward to the octave — this
     is the one state the device reports as finished rather than as ongoing. */
  complete: {
    pulses: 4, bursts: 1, notes: [523, 659, 784, 1047],
    dur: 0.11, gap: 0.05, rest: 0, gain: 0.085, type: 'sine',
  },
  /* The clinician has been paged. ALTERNATING TWO-TONE, which is the one
     contour nothing else in this set uses — everything else rises, falls or
     holds flat. That is deliberate: this is not the device reporting a fault
     and it is not a check passing, it is a call going out to a person, and the
     alternating pair is the convention a call already has.

     Explicitly NOT the occlusion cue. The two are the most urgent things that
     happen on this device and they are opposite in origin: one is the pump
     telling the nurse something, the other is the nurse telling a clinician
     something. Giving them the same sound would make the most important
     distinction on the device the one the audio channel throws away. */
  escalate: {
    pulses: 4, bursts: 1, notes: [880, 659, 880, 659],
    dur: 0.14, gap: 0.03, rest: 0, gain: 0.11, type: 'triangle',
  },
  /* A record was written. Quiet and singular: it confirms receipt, it is not
     news. */
  ack: {
    pulses: 1, bursts: 1, notes: [698],
    dur: 0.13, gap: 0, rest: 0, gain: 0.07, type: 'sine',
  },
  /* A control refused. Low, short, unmistakably not a confirmation — it must
     never be possible to mistake "that did not work" for "that worked". */
  deny: {
    pulses: 2, bursts: 1, notes: [233, 196],
    dur: 0.1, gap: 0.04, rest: 0, gain: 0.09, type: 'triangle',
  },
};

export function playCue(name) {
  if (!enabled) return;
  const cue = CUES[name];
  if (!cue) {
    if (import.meta.env.DEV) console.warn(`[medflow] unknown audio cue "${name}"`);
    return;
  }
  const ac = context();
  if (!ac) return;

  const burstLength = cue.pulses * (cue.dur + cue.gap);
  let t = ac.currentTime + 0.01;

  for (let b = 0; b < cue.bursts; b += 1) {
    for (let i = 0; i < cue.pulses; i += 1) {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = cue.type;
      osc.frequency.setValueAtTime(cue.notes[i % cue.notes.length], t);

      /* A short attack and an exponential release rather than a square on/off.
         A gain step produces an audible click at the edges, and a click is the
         most attention-grabbing part of a badly made alert — the artefact ends
         up louder than the signal. */
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(cue.gain, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + cue.dur);

      osc.connect(gain).connect(ac.destination);
      osc.start(t);
      osc.stop(t + cue.dur + 0.02);
      t += cue.dur + cue.gap;
    }
    if (b < cue.bursts - 1) t += cue.rest;
  }
  return burstLength;
}

/* For the design-system section, so the page can describe its own cues from the
   same source that plays them rather than from a hand-written table that could
   drift out of date. */
export const CUE_SPEC = [
  { id: 'alarm', label: 'Occlusion alarm', shape: '2 bursts of 5, falling', use: 'Delivery stopped by the device', tone: 'crit' },
  { id: 'block', label: 'Progression blocked', shape: '1 burst of 3, falling', use: 'Entered rate does not match the order', tone: 'attn' },
  { id: 'pause', label: 'Paused', shape: '2 flat tones, low', use: 'Delivery stopped by the nurse', tone: 'off' },
  { id: 'confirm', label: 'Check passed', shape: '2 tones, rising', use: 'Identity verified, infusion resumed', tone: 'run' },
  { id: 'start', label: 'Therapy started', shape: '3 tones, rising', use: 'Simulated infusion initiated', tone: 'run' },
  { id: 'complete', label: 'Infusion complete', shape: '4 tones, rising to the octave', use: 'Therapy ran to term', tone: 'run' },
  { id: 'escalate', label: 'Clinician paged', shape: '4 tones, alternating pair', use: 'Urgent escalation sent from the bell', tone: 'crit' },
  { id: 'ack', label: 'Record written', shape: '1 tone', use: 'Alarm or completion acknowledged', tone: 'info' },
  { id: 'deny', label: 'Control refused', shape: '2 tones, falling, low', use: 'A disabled control was pressed', tone: 'crit' },
];
