export interface Professor {
  id: string;
  name: string;
  department: string;
  university: string;
  researchTags: string[];
  baseScore: number;
  latestPaper: string;
  paperAbstract: string;
  fundingStatus: string;
  email: string;
  initials: string;
  avatarColor: string;
}

export interface ScoredProfessor extends Professor {
  matchScore: number;
  matchReason: string;
}

export interface StudentProfile {
  name: string;
  skills: string[];
  researchDomains: string[];
  backgroundSummary: string;
  proposedProject: string;
  rawInterests: string;
}
