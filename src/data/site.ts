export const profile = {
  name: 'Yara Debian',
  role: 'AI Engineer',
  city: '[CITY]',
  email: '[EMAIL]',
  description:
    'AI engineer who still thinks in Ruby, speaker who asks slightly-too-big questions, and weekend clay sculptor. Notes on code, art, philosophy and learning AI in public.',
  links: [
    { label: 'linkedin', href: 'https://www.linkedin.com/in/yara-debian-512a011a0/' },
    { label: 'github', href: 'https://github.com/YaraDebian' },
    { label: 'instagram [handle]', href: '#' },
  ],
};

export const currently = [
  ['reading', 'Sophie’s World'],
  ['learning', '[WHAT YOU’RE LEARNING]'],
  ['sculpting', '[CURRENT CLAY PROJECT]'],
  ['wondering', 'why bad code bothers us when it works'],
];

export const pastel = {
  peach: '#F9D5C4',
  lilac: '#E4D6F3',
  sky: '#CFE2F2',
  mint: '#D3E8CF',
  butter: '#F6E5A6',
};

export const chapters = [
  {
    label: 'prologue · [YEAR]',
    title: 'the practical choice',
    body: '[STUDIES / FIRST ROLE]. Code was sensible, not a calling — yet.',
    tape: pastel.peach,
    tilt: -1.5,
  },
  {
    label: 'chapter 1 · [YEARS]',
    title: 'Rails @ Factorial',
    body: 'User-focused web apps, a soft spot for clean code, and mentoring — bridging vision and development.',
    tape: pastel.sky,
    tilt: 1.2,
  },
  {
    label: 'chapter 2 · 2025–26',
    title: 'on stage',
    body: 'Painting meets programming at Helvetic Ruby. Then Plato, Aristotle, Hegel and Kant walk into a Rails talk.',
    tape: pastel.lilac,
    tilt: -0.8,
  },
  {
    label: 'chapter 3 · now ★',
    title: 'AI engineer',
    body: '[COMPANY] — [WHAT YOU BUILD]. AI raised the floor on <em>how</em>; I’m here for the <em>why</em>.',
    tape: pastel.butter,
    tilt: 1.8,
    current: true,
  },
];

export type Talk = {
  title: string;
  event: string;
  year: string;
  blurb: string;
  color: string;
  art: 'palette' | 'temple';
  tilt: number;
  slides?: string;
  video?: string;
  summary?: string;
};

export const talks: Talk[] = [
  {
    title: 'The Art of Code: finding aesthetics in logic',
    event: 'Helvetic Ruby',
    year: '2025',
    blurb:
      'What if writing code and creating art aren’t as different as we think? The blank canvas and the empty file, Bauhaus and negative space, and why empathy makes both a painting and an app delightful.',
    color: pastel.lilac,
    art: 'palette',
    tilt: -0.8,
    video: 'https://www.youtube.com/watch?v=phz2kCBv6OA',
    summary: 'https://www.rubyevents.org/talks/the-art-of-code-finding-aesthetics-in-logic',
  },
  {
    title: 'From Plato to Production',
    event: 'Rubycon',
    year: '2026',
    blurb:
      'Are you building things, or are you thinking — and code is just the residue? Four philosophers, one Rails controller, an N+1 that was secretly wise, and a twist borrowed from <em>Sophie’s World</em>.',
    color: pastel.sky,
    art: 'temple',
    tilt: 0.9,
    video: 'https://www.rubyevents.org/talks/from-plato-to-production-a-philosophical-history-of-code',
    slides: 'https://speakerdeck.com/yaradeb123/from-plato-to-production',
  },
];

// Drop photos into public/made/ and set `src` (e.g. '/made/vase.jpg'); without one a labelled placeholder shows.
export const made: { src?: string; title: string; medium: string; year: string; color: string; tilt: number }[] = [
  { title: '[title]', medium: 'air-dry clay', year: '[year]', color: pastel.peach, tilt: -3 },
  { title: '[title]', medium: 'oil pastel', year: '[year]', color: pastel.sky, tilt: 2 },
  { title: '[title]', medium: 'air-dry clay', year: '[year]', color: pastel.lilac, tilt: -1 },
];

export const tagColors: Record<string, string> = {
  philosophy: pastel.lilac,
  rails: pastel.peach,
  'ai engineering': pastel.sky,
  art: pastel.mint,
};
export const markColors: Record<string, string> = {
  philosophy: '#CDB4EC',
  rails: '#F4B49A',
  'ai engineering': '#9EC5E8',
  art: '#B9DDB2',
};
export const markColor = (tag?: string) => (tag && markColors[tag]) || '#CDB4EC';
const fallback = [pastel.butter, pastel.mint, pastel.peach, pastel.sky, pastel.lilac];
export const tagColor = (tag: string, i = 0) => tagColors[tag] ?? fallback[i % fallback.length];
