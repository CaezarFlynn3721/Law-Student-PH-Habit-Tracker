export type HabitCategory = 'study' | 'workout';
export type TimerType = 'pomodoro' | 'short_break' | 'long_break' | 'custom';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  category: HabitCategory;
  frequency: 'daily' | 'weekly';
  completedDates: string[]; // dates like "YYYY-MM-DD"
  streak: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TimerSession {
  id: string;
  userId: string;
  duration: number; // in seconds
  type: TimerType;
  subject: string;
  completedAt: string;
}

export interface CaseBrief {
  id: string;
  userId: string;
  title: string;
  citation: string;
  facts: string;
  issue: string;
  holding: string;
  notes: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PagesReadEntry {
  id: string;
  userId: string;
  count: number;
  subject: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  theme?: string;
  updatedAt?: string;
}

export const PRESET_LAW_SUBJECTS = [
  'PERSONS AND FAMILY RELATIONS',
  'PROPERTY LAW',
  'SALES',
  'OBLIGATIONS AND CONTRACTS',
  'SUCCESSION',
  'LAND TITLES AND DEEDS',
  'CONSTITUTIONAL LAW I',
  'CONSTITUTIONAL LAW II',
  'PUBLIC CORPORATIONS',
  'ADMINISTRATIVE LAW',
  'ELECTION LAWS',
  'LABOR LAW',
  'TAXATION LAWS',
  'CIVIL PROCEDURE',
  'CRIMINAL PROCEDURE',
  'PROVISIONAL REMEDIES/SCA',
  'SPECIAL PROCEEDINGS',
  'EVIDENCE',
  'COMMERCIAL LAWS',
  'CRIMINAL LAW',
  'WORKOUT AND HEALTH'
];

export interface LawQuote {
  quote: string;
  author: string;
  explanation?: string;
}

export const LAW_FOCUS_QUOTES: LawQuote[] = [
  {
    quote: "The law is a profession of words.",
    author: "David Mellinkoff",
    explanation: "Precision in your reading and writing shapes the outcome of arguments."
  },
  {
    quote: "Ignorantia juris non excusat.",
    author: "Legal Maxim",
    explanation: "Ignorance of the law excuses no one. Study with absolute dilgence."
  },
  {
    quote: "If you want to understand the law, look at it as a bad man who cares only for the consequences.",
    author: "Oliver Wendell Holmes Jr.",
    explanation: "Analyze the operational realities and remedies, not just the moral ideals."
  },
  {
    quote: "Justice delayed is justice denied.",
    author: "William E. Gladstone",
    explanation: "Stay focused. Every hour you spend outlines a case more clearly for your future clients."
  },
  {
    quote: "The visual appearance of justice is as important as the substance of justice.",
    author: "Lord Hewart",
    explanation: "A clean brief is a persuasive brief. Order your mind and your studies."
  },
  {
    quote: "Res ipsa loquitur.",
    author: "Legal Maxim",
    explanation: "The thing speaks for itself. Let your consistent high-quality daily habits speak for your preparation."
  },
  {
    quote: "Fiat justitia ruat caelum.",
    author: "Legal Maxim",
    explanation: "Let justice be done though the heavens fall."
  }
];

// Famous Case Flashcards for offline/pre-loaded study
export interface CaseFlashcard {
  id: string;
  title: string;
  citation: string;
  facts: string;
  holding: string;
  takeaway: string;
}

export const PRESET_FLASHCARDS: CaseFlashcard[] = [
  {
    id: 'f1',
    title: "Marbury v. Madison",
    citation: "5 U.S. 137 (1803)",
    facts: "William Marbury was appointed a justice of the peace but his commission was not delivered before President Adams left office. Jefferson's Secretary of State, Madison, refused to deliver it.",
    holding: "Congress cannot expand the original jurisdiction of the Supreme Court, and any law repugnant to the Constitution is void.",
    takeaway: "Established Judicial Review—the power of federal courts to declare legislative acts unconstitutional."
  },
  {
    id: 'f2',
    title: "Pennoyer v. Neff",
    citation: "95 U.S. 714 (1878)",
    facts: "Neff owned land in Oregon. An Oregon attorney sued Neff for unpaid fees and served Neff solely by publishing a notice in a local newspaper. Oregon court sold Neff's land to Pennoyer to satisfy a judgment.",
    holding: "A state court cannot exercise personal jurisdiction over a non-resident defendant unless they are served in-state or have property attached at the outset.",
    takeaway: "Foundational Civil Procedure case linking territory of the state to personal jurisdiction and Due Process."
  },
  {
    id: 'f3',
    title: "Brown v. Board of Education",
    citation: "347 U.S. 483 (1954)",
    facts: "African American students were denied admission to public schools under state laws requiring or permitting segregation based on race, under the 'separate but equal' doctrine.",
    holding: "Racial segregation in public schools violates the Equal Protection Clause of the Fourteenth Amendment because separate educational facilities are inherently unequal.",
    takeaway: "Overturned Plessy v. Ferguson's separate but equal standard in public education."
  },
  {
    id: 'f4',
    title: "Hadley v. Baxendale",
    citation: "9 Exch. 341 (1854)",
    facts: "Hadley, a mill operator, sent a broken crank shaft to the manufacturer via Defendant carrier, Baxendale. Baxendale delayed delivery, causing the mill to stay closed. Hadley sued for lost profits.",
    holding: "Damages for breach of contract are those that arise naturally from the breach or those that were in the contemplation of both parties at the time of the contract.",
    takeaway: "Established the legendary rule of foreseeability in contract damages."
  },
  {
    id: 'f5',
    title: "Hawkins v. McGee",
    citation: "84 N.H. 114 (1929)",
    facts: "A doctor ('McGee') guaranteed to give a boy a 'one hundred percent perfect hand' via skin grafting surgery. The surgery failed, leaving Hawkins with a scarred, hairy palm.",
    holding: "The measure of damages is the expectation interest: the difference between the value of the hand as promised and its actual value after the surgery.",
    takeaway: "Legendary contracts case defining expectation damages (the 'Hairy Hand' case)."
  }
];
