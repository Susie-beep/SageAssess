export type Language = 'zh' | 'en';
export type Role = 'student' | 'teacher';
export type TeacherId = 'teacher_a' | 'teacher_b';

export type AssessmentSubject = 'listening' | 'reading' | 'writing' | 'speaking';
export type SubjectStatus = 'not_started' | 'in_progress' | 'submitted';
export type TaskStatus = 'pending' | 'claimed' | 'draft_saved' | 'published';

export interface StudentProfile {
  name: string;
  enName: string;
  phone: string;
  email: string;
  targetOverall: number;
  targetListening: number;
  targetReading: number;
  targetWriting: number;
  targetSpeaking: number;
  examMonth: string;
  currentLevel: string;
  weeklyHours: number;
  studentDeclaration: boolean;
  submittedAt: string;
}

export interface ListeningQuestion {
  id: number;
  type: 'multiple_choice' | 'fill_blank';
  instruction: string;
  question: string;
  options?: string[];
  userAnswer: string;
  correctAnswer: string;
  isCorrect?: boolean;
  explanation: string;
}

export interface ListeningData {
  status: SubjectStatus;
  playCount: number;
  submittedAt: string;
  questions: ListeningQuestion[];
  audioScript: string;
}

export interface ReadingQuestion {
  id: number;
  type: 'true_false_not_given' | 'multiple_choice' | 'summary_completion';
  instruction: string;
  question: string;
  options?: string[];
  userAnswer: string;
  correctAnswer: string;
  isCorrect?: boolean;
  explanation: string;
}

export interface ReadingData {
  status: SubjectStatus;
  submittedAt: string;
  passageTitle: string;
  passageSubtitle: string;
  passageParagraphs: { label: string; text: string }[];
  questions: ReadingQuestion[];
  highlightedSnippets: string[];
}

export interface WritingDimensionScore {
  criterion: 'TR' | 'CC' | 'LR' | 'GRA';
  nameZh: string;
  nameEn: string;
  aiScore: number;
  aiFeedback: string;
  teacherScore: number;
  teacherFeedback: string;
}

export interface WritingData {
  status: SubjectStatus;
  submittedAt: string;
  promptTask2: string;
  userEssay: string;
  wordCount: number;
  dimensions: WritingDimensionScore[];
  task1Note: string;
}

export interface SpeakingQuestion {
  id: number;
  part: 1 | 2 | 3;
  partTitle: string;
  questionText: string;
  promptAudioUrl?: string;
  promptPlayCount: number;
  transcriptOpened: boolean;
  transcriptViewCount: number;
  userAudioUrl?: string;
  userAudioDurationSeconds: number;
  userTranscript: string;
}

export interface SpeakingDimensionScore {
  criterion: 'FC' | 'LR' | 'GRA' | 'PR';
  nameZh: string;
  nameEn: string;
  aiScore: number | null; // PR is null by default for AI
  aiFeedback: string;
  teacherScore: number;
  teacherFeedback: string;
}

export interface SpeakingData {
  status: SubjectStatus;
  submittedAt: string;
  questions: SpeakingQuestion[];
  dimensions: SpeakingDimensionScore[];
}

export interface SubjectFeedback {
  aiSummary: string;
  teacherFeedback: string;
  teacherAdjustedScore?: number;
}

export interface OverallReport {
  aiOverallBand: number;
  teacherOverallBand: number;
  targetOverallBand: number;
  listeningBand: number;
  readingBand: number;
  writingBand: number;
  speakingBand: number;
  // Sub-dimension summaries
  strengths: string[];
  weaknesses: string[];
  recommendedCourse: string;
  recommendedCourseLevel: string;
  estimatedWeeks: string;
  weeklyHoursAdvice: number;
  studyPhases: {
    phase: string;
    focus: string;
    duration: string;
  }[];
  reviewedByTeacherName: string;
  reviewedByTeacherId: TeacherId;
  publishedAt: string;
  reportVersion: string;
  reportId: string;
}

export interface AssessmentRecord {
  id: string;
  student: StudentProfile;
  listening: ListeningData;
  reading: ReadingData;
  writing: WritingData;
  speaking: SpeakingData;
  listeningFeedback: SubjectFeedback;
  readingFeedback: SubjectFeedback;
  overall: OverallReport;
  taskStatus: TaskStatus;
  claimedBy: TeacherId | null;
  claimedByName: string | null;
  claimedAt: string | null;
  lastDraftSavedAt: string | null;
  publishedReportSnapshot: OverallReport | null;
  isAllSubjectsSubmitted: boolean;
  comprehensiveSubmitted: boolean;
}
