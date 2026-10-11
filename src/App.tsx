/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  AssessmentRecord, 
  Language, 
  Role, 
  StudentProfile, 
  TeacherId 
} from './types/assessment';
import { 
  getStoredRecords, 
  saveStoredRecords, 
  resetStoredRecords, 
  claimTaskAction, 
  saveTaskDraft, 
  publishTaskReport 
} from './utils/storage';
import { Header } from './components/Header';
import { HubView } from './components/HubView';
import { ListeningView } from './components/ListeningView';
import { ReadingView } from './components/ReadingView';
import { WritingView } from './components/WritingView';
import { SpeakingView } from './components/SpeakingView';
import { ProfileView } from './components/ProfileView';
import { TeacherWorkbenchView } from './components/TeacherWorkbenchView';
import { TeacherReviewView } from './components/TeacherReviewView';
import { ReportView } from './components/ReportView';

export default function App() {
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string>('task-wang-001');
  const [role, setRole] = useState<Role>('student');
  const [activeTeacherId, setActiveTeacherId] = useState<TeacherId>('teacher_a');
  const [lang, setLang] = useState<Language>('zh');
  const [view, setView] = useState<string>('hub'); // Default student entry is 4-skills Hub per V1.4

  // Initialize records from storage
  useEffect(() => {
    const loaded = getStoredRecords();
    setRecords(loaded);
  }, []);

  // Active student assessment record (Wang Chen by default)
  const activeRecord = records.find((r) => r.id === currentTaskId) || records[0];

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'zh' ? 'en' : 'zh'));
  };

  const handleResetData = () => {
    const fresh = resetStoredRecords();
    setRecords(fresh);
    setCurrentTaskId('task-wang-001');
    setView('hub');
  };

  // Student updates single subject response
  const handleUpdateRecord = (updatedRecord: AssessmentRecord) => {
    const updatedList = records.map((r) => (r.id === updatedRecord.id ? updatedRecord : r));
    setRecords(updatedList);
    saveStoredRecords(updatedList);
  };

  // Student submits comprehensive assessment
  const handleSubmitComprehensive = () => {
    if (!activeRecord) return;
    const updated: AssessmentRecord = {
      ...activeRecord,
      comprehensiveSubmitted: true,
      taskStatus: activeRecord.taskStatus === 'pending' ? 'pending' : activeRecord.taskStatus,
    };
    handleUpdateRecord(updated);
    alert(
      lang === 'zh'
        ? '四科综合诊断作答已成功提交至教研复核队列！您可以直接点击“诊断报告”查看看板，或切换到教师端体验认领与复核流程。'
        : 'All 4 modules successfully submitted to the teacher review queue! You can view the report preview or switch to Teacher view to claim and review.'
    );
  };

  // Student updates profile
  const handleSaveProfile = (profile: StudentProfile) => {
    if (!activeRecord) return;
    const updated: AssessmentRecord = {
      ...activeRecord,
      student: profile,
    };
    handleUpdateRecord(updated);
  };

  // Teacher claims task (mutex check)
  const handleClaimTask = (taskId: string) => {
    const teacherName =
      activeTeacherId === 'teacher_a'
        ? '张老师 (Teacher Zhang · 资深考官级教研员)'
        : '李老师 (Teacher Li · 雅思教研组长)';

    const result = claimTaskAction(taskId, activeTeacherId, teacherName);
    setRecords(result.updatedRecords);

    if (result.success) {
      setCurrentTaskId(taskId);
      setView('teacher-audit');
    } else {
      alert(result.message || '领取失败');
    }
  };

  // Teacher opens audit view
  const handleOpenAudit = (taskId: string) => {
    setCurrentTaskId(taskId);
    setView('teacher-audit');
  };

  // Teacher saves draft
  const handleSaveDraft = (updated: AssessmentRecord) => {
    const updatedList = saveTaskDraft(updated.id, updated);
    setRecords(updatedList);
  };

  // Teacher publishes final report
  const handlePublishReport = (finalRecord: AssessmentRecord) => {
    const updatedList = publishTaskReport(finalRecord.id, finalRecord);
    setRecords(updatedList);
  };

  if (!activeRecord) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-slate-600">
        加载中 / Loading Sage Assessment...
      </div>
    );
  }

  const hasPublishedReport = activeRecord.taskStatus === 'published' && activeRecord.publishedReportSnapshot !== null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        role={role}
        onSelectRole={(newRole) => {
          setRole(newRole);
          if (newRole === 'student') {
            // Per V1.4: "点击‘学生端 / Student’始终进入四科测评中心"
            setView('hub');
          } else {
            setView('teacher-workbench');
          }
        }}
        activeTeacherId={activeTeacherId}
        onSelectTeacher={setActiveTeacherId}
        currentView={view}
        onNavigate={setView}
        onResetData={handleResetData}
        hasPublishedReport={hasPublishedReport}
      />

      <main className="flex-1">
        {/* Student Hub View (S03) */}
        {view === 'hub' && (
          <HubView
            record={activeRecord}
            lang={lang}
            onSelectSubject={(subject) => setView(subject)}
            onSubmitComprehensive={handleSubmitComprehensive}
            onNavigateReport={() => setView('report')}
            onNavigateProfile={() => setView('profile')}
          />
        )}

        {/* Listening View (S04) */}
        {view === 'listening' && (
          <ListeningView
            record={activeRecord}
            lang={lang}
            onBack={() => setView('hub')}
            onSave={handleUpdateRecord}
          />
        )}

        {/* Reading View (S05) */}
        {view === 'reading' && (
          <ReadingView
            record={activeRecord}
            lang={lang}
            onBack={() => setView('hub')}
            onSave={handleUpdateRecord}
          />
        )}

        {/* Writing View (S06) */}
        {view === 'writing' && (
          <WritingView
            record={activeRecord}
            lang={lang}
            onBack={() => setView('hub')}
            onSave={handleUpdateRecord}
          />
        )}

        {/* Speaking View (S07) */}
        {view === 'speaking' && (
          <SpeakingView
            record={activeRecord}
            lang={lang}
            onBack={() => setView('hub')}
            onSave={handleUpdateRecord}
          />
        )}

        {/* Student Profile View (S02) */}
        {view === 'profile' && (
          <ProfileView
            record={activeRecord}
            lang={lang}
            onBack={() => setView('hub')}
            onSaveProfile={handleSaveProfile}
          />
        )}

        {/* Teacher Workbench View (T01) */}
        {view === 'teacher-workbench' && (
          <TeacherWorkbenchView
            records={records}
            activeTeacherId={activeTeacherId}
            lang={lang}
            onSelectTeacher={setActiveTeacherId}
            onClaimTask={handleClaimTask}
            onOpenAudit={handleOpenAudit}
            onOpenPublishedReport={(taskId) => {
              setCurrentTaskId(taskId);
              setView('report');
            }}
          />
        )}

        {/* Teacher Review / Audit View (T02/T03) */}
        {view === 'teacher-audit' && (
          <TeacherReviewView
            record={activeRecord}
            activeTeacherId={activeTeacherId}
            lang={lang}
            onBack={() => setView('teacher-workbench')}
            onSaveDraft={handleSaveDraft}
            onPublishReport={handlePublishReport}
          />
        )}

        {/* Comprehensive Report View (S09 / V1.3 / V1.4) */}
        {view === 'report' && (
          <ReportView
            record={activeRecord}
            lang={lang}
            onBackToHub={() => setView('hub')}
          />
        )}
      </main>
    </div>
  );
}
