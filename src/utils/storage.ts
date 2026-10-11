import { AssessmentRecord, TeacherId } from '../types/assessment';
import { INITIAL_ASSESSMENT_RECORDS } from '../data/mockData';

const STORAGE_KEY = 'SAGE_ASSESSMENT_V3';

export const getStoredRecords = (): AssessmentRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ASSESSMENT_RECORDS));
      return INITIAL_ASSESSMENT_RECORDS;
    }
    return JSON.parse(raw) as AssessmentRecord[];
  } catch (e) {
    console.error('Failed to parse stored records, resetting to initial', e);
    return INITIAL_ASSESSMENT_RECORDS;
  }
};

export const saveStoredRecords = (records: AssessmentRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to persist assessment records', e);
  }
};

export const resetStoredRecords = (): AssessmentRecord[] => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ASSESSMENT_RECORDS));
  } catch (e) {
    console.error('Failed to reset storage', e);
  }
  return INITIAL_ASSESSMENT_RECORDS;
};

export const claimTaskAction = (
  taskId: string,
  teacherId: TeacherId,
  teacherName: string
): { success: boolean; updatedRecords: AssessmentRecord[]; message?: string } => {
  const records = getStoredRecords();
  const index = records.findIndex((r) => r.id === taskId);
  if (index === -1) {
    return { success: false, updatedRecords: records, message: 'Task not found' };
  }

  const current = records[index];
  // Mutex check: If claimed by a different teacher and not published, deny!
  if (current.claimedBy && current.claimedBy !== teacherId && current.taskStatus !== 'published') {
    return {
      success: false,
      updatedRecords: records,
      message: `该任务已被 ${current.claimedByName || current.claimedBy} 锁定，暂无法跨账号办理。`,
    };
  }

  const updated: AssessmentRecord = {
    ...current,
    claimedBy: teacherId,
    claimedByName: teacherName,
    claimedAt: new Date().toLocaleString(),
    taskStatus: 'claimed',
  };

  records[index] = updated;
  saveStoredRecords(records);
  return { success: true, updatedRecords: records };
};

export const saveTaskDraft = (
  taskId: string,
  updatedData: Partial<AssessmentRecord>
): AssessmentRecord[] => {
  const records = getStoredRecords();
  const index = records.findIndex((r) => r.id === taskId);
  if (index === -1) return records;

  records[index] = {
    ...records[index],
    ...updatedData,
    lastDraftSavedAt: new Date().toLocaleString(),
    taskStatus: 'draft_saved',
  };

  saveStoredRecords(records);
  return records;
};

export const publishTaskReport = (
  taskId: string,
  finalRecord: AssessmentRecord
): AssessmentRecord[] => {
  const records = getStoredRecords();
  const index = records.findIndex((r) => r.id === taskId);
  if (index === -1) return records;

  const publishedOverall = {
    ...finalRecord.overall,
    publishedAt: new Date().toLocaleString(),
    reportVersion: `SAGE-REV-${Date.now().toString().slice(-6)}`,
  };

  records[index] = {
    ...finalRecord,
    overall: publishedOverall,
    publishedReportSnapshot: publishedOverall,
    taskStatus: 'published',
  };

  saveStoredRecords(records);
  return records;
};
