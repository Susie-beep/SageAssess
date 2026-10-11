import React, { useState } from 'react';
import { AssessmentRecord, Language, OverallReport, TeacherId } from '../types/assessment';
import { translations } from '../utils/i18n';
import { 
  ArrowLeft, 
  GraduationCap, 
  Save, 
  Send, 
  ShieldAlert, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Volume2, 
  Play, 
  Eye, 
  Edit3, 
  FileText, 
  Sparkles,
  Award,
  RotateCcw,
  Bot
} from 'lucide-react';

interface TeacherReviewViewProps {
  record: AssessmentRecord;
  activeTeacherId: TeacherId;
  lang: Language;
  onBack: () => void;
  onSaveDraft: (updatedRecord: AssessmentRecord) => void;
  onPublishReport: (finalRecord: AssessmentRecord) => void;
}

export const TeacherReviewView: React.FC<TeacherReviewViewProps> = ({
  record,
  activeTeacherId,
  lang,
  onBack,
  onSaveDraft,
  onPublishReport,
}) => {
  const t = translations[lang];

  // Mutex Check: Is the active teacher the owner?
  const isOwner = record.claimedBy === activeTeacherId || record.claimedBy === null;
  const isReadOnly = !isOwner && record.taskStatus !== 'published';

  // Editable local state
  const [recordData, setRecordData] = useState<AssessmentRecord>(record);
  const [activeTab, setActiveTab] = useState<'overall' | 'writing' | 'speaking' | 'listening_reading'>('overall');
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'warn' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warn' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Writing dimension score changes
  const handleWritingScoreChange = (index: number, score: number, feedback: string) => {
    if (isReadOnly) return;
    const updatedDims = [...recordData.writing.dimensions];
    updatedDims[index] = {
      ...updatedDims[index],
      teacherScore: score,
      teacherFeedback: feedback,
    };
    setRecordData({
      ...recordData,
      writing: {
        ...recordData.writing,
        dimensions: updatedDims,
      },
    });
  };

  // Reset Writing dimension to AI suggested feedback
  const handleResetWritingToAi = (index: number) => {
    if (isReadOnly) return;
    const dim = recordData.writing.dimensions[index];
    handleWritingScoreChange(index, dim.aiScore, dim.aiFeedback);
    showToast(`已将 ${dim.criterion} 重置为 AI 建议初稿`, 'success');
  };

  // Speaking dimension score changes
  const handleSpeakingScoreChange = (index: number, score: number, feedback: string) => {
    if (isReadOnly) return;
    const updatedDims = [...recordData.speaking.dimensions];
    updatedDims[index] = {
      ...updatedDims[index],
      teacherScore: score,
      teacherFeedback: feedback,
    };
    setRecordData({
      ...recordData,
      speaking: {
        ...recordData.speaking,
        dimensions: updatedDims,
      },
    });
  };

  // Reset Speaking dimension to AI suggested feedback
  const handleResetSpeakingToAi = (index: number) => {
    if (isReadOnly) return;
    const dim = recordData.speaking.dimensions[index];
    const defaultScore = dim.aiScore ?? 6.0;
    handleSpeakingScoreChange(index, defaultScore, dim.aiFeedback);
    showToast(`已将 ${dim.criterion} 重置为 AI 建议初稿`, 'success');
  };

  // Save Draft
  const handleSaveDraft = () => {
    if (isReadOnly) return;
    onSaveDraft(recordData);
    showToast(t.draftSavedMsg, 'success');
  };

  // Confirm and Publish
  const handlePublish = () => {
    if (isReadOnly) return;
    onPublishReport(recordData);
    showToast(t.publishSuccessMsg, 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#173A55] font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回教师工作台</span>
        </button>

        <div className="flex items-center gap-3">
          {isReadOnly && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>由 {record.claimedByName ? record.claimedByName.split(' ')[0] : '其他教师'} 锁定 · 只读模式</span>
            </span>
          )}
          {record.taskStatus === 'published' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              已发布状态
            </span>
          )}
        </div>
      </div>

      {/* Mutex Warning Banner if Read-Only */}
      {isReadOnly && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{t.viewOnlyNotice}</p>
            <p className="text-slate-600 mt-1">
              如需修改此学生的评分或发布报告，请切换为该认领教师账号。
            </p>
          </div>
        </div>
      )}

      {/* Important Notice regarding AI Draft & Unified Student Report */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-xs text-sky-950 flex items-start gap-2.5">
        <Bot className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-[#173A55]">
            评语生成机制与学生端交付说明：
          </span>
          <p className="text-sky-900 leading-relaxed text-[11px]">
            各科目的初始诊断评语已全部由 AI 自动生成草案，老师可直接点击任意文本框进行修改、微调或确认。<strong>在最终生成的《学员诊断报告》中，只会统一展示最终核定评价与分数，不出现 AI 或教师区分标识</strong>，便于学员清晰理解评测结果。
          </p>
        </div>
      </div>

      {/* Candidate Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#173A55] text-amber-200 font-serif font-bold text-xl flex items-center justify-center">
            {recordData.student.name.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#173A55]">
                {recordData.student.name} ({recordData.student.enName})
              </h1>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                {recordData.student.phone}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              目标总分: Band {recordData.student.targetOverall} (L{recordData.student.targetListening} R{recordData.student.targetReading} W{recordData.student.targetWriting} S{recordData.student.targetSpeaking}) · 考试月份: {recordData.student.examMonth} · 每周: {recordData.student.weeklyHours}h
            </p>
          </div>
        </div>

        {/* Action Buttons (Save Draft & Publish) */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            disabled={isReadOnly}
            onClick={handleSaveDraft}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              isReadOnly
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>{t.saveDraftBtn}</span>
          </button>

          <button
            disabled={isReadOnly}
            onClick={handlePublish}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm ${
              isReadOnly
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-[#C4A46A] hover:bg-[#b09057] text-[#173A55]'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{t.publishReportBtn}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {feedbackToast && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-3 rounded-xl shadow-lg flex items-center justify-between transition">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{feedbackToast.message}</span>
          </div>
        </div>
      )}

      {/* Audit Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overall')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'overall'
              ? 'bg-[#173A55] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          综合评语与分班建议
        </button>
        <button
          onClick={() => setActiveTab('writing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'writing'
              ? 'bg-[#173A55] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          写作 Task 2 四维复核
        </button>
        <button
          onClick={() => setActiveTab('speaking')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'speaking'
              ? 'bg-[#173A55] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          口语听音与四维复核
        </button>
        <button
          onClick={() => setActiveTab('listening_reading')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'listening_reading'
              ? 'bg-[#173A55] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          听力 & 阅读客观题复核
        </button>
      </div>

      {/* Tab 1: Overall Recommendations */}
      {activeTab === 'overall' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-[#173A55] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C4A46A]" />
              <span>综合评定与班型学习路径规划 (AI初拟 · 教师确认)</span>
            </h2>
            <span className="text-xs text-slate-400">点击文本框可直接微调修改</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/70 space-y-1">
              <span className="text-[11px] font-bold text-amber-800 uppercase">最终确认综合总分</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="4.0"
                  max="9.0"
                  disabled={isReadOnly}
                  value={recordData.overall.teacherOverallBand}
                  onChange={(e) =>
                    setRecordData({
                      ...recordData,
                      overall: {
                        ...recordData.overall,
                        teacherOverallBand: parseFloat(e.target.value) || 6.5,
                      },
                    })
                  }
                  className="w-24 px-2 py-1 text-xl font-serif font-bold text-[#173A55] bg-white border border-amber-300 rounded-lg text-center focus:outline-none"
                />
                <span className="text-xs text-slate-500">AI初评: {recordData.overall.aiOverallBand}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">学员目标总分</span>
              <div className="text-2xl font-serif font-bold text-emerald-700">
                Band {recordData.overall.targetOverallBand}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">每周投入时间建议</span>
              <div className="text-2xl font-serif font-bold text-[#173A55]">
                {recordData.overall.weeklyHoursAdvice} 小时 / 周
              </div>
            </div>
          </div>

          {/* Recommended Course & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                推荐匹配班型 (Course Placement)
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={recordData.overall.recommendedCourse}
                onChange={(e) =>
                  setRecordData({
                    ...recordData,
                    overall: {
                      ...recordData.overall,
                      recommendedCourse: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-semibold text-[#173A55] bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                预计学习备考周期 (Estimated Duration)
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={recordData.overall.estimatedWeeks}
                onChange={(e) =>
                  setRecordData({
                    ...recordData,
                    overall: {
                      ...recordData.overall,
                      estimatedWeeks: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-semibold text-[#173A55] bg-slate-50/50"
              />
            </div>
          </div>

          {/* Core Strengths & Weaknesses */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                核心能力优势 (AI智能提炼 · 供报告展示)
              </label>
              <textarea
                rows={2}
                disabled={isReadOnly}
                value={recordData.overall.strengths.join('\n')}
                onChange={(e) =>
                  setRecordData({
                    ...recordData,
                    overall: {
                      ...recordData.overall,
                      strengths: e.target.value.split('\n'),
                    },
                  })
                }
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                优先突破短板与提分空间 (AI智能提炼 · 供报告展示)
              </label>
              <textarea
                rows={2}
                disabled={isReadOnly}
                value={recordData.overall.weaknesses.join('\n')}
                onChange={(e) =>
                  setRecordData({
                    ...recordData,
                    overall: {
                      ...recordData.overall,
                      weaknesses: e.target.value.split('\n'),
                    },
                  })
                }
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-sans"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Writing Review */}
      {activeTab === 'writing' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-[#173A55] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#C4A46A]" />
              <span>Academic Writing Task 2 四维评语确认</span>
            </h2>
            <span className="text-xs text-slate-500">
              作文总字数: {recordData.writing.wordCount} 词
            </span>
          </div>

          {/* Essay Collapsible Reference */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed max-h-48 overflow-y-auto">
            <span className="font-bold text-[#173A55] block mb-1">考生作答原文：</span>
            <p className="font-sans whitespace-pre-wrap">{recordData.writing.userEssay}</p>
          </div>

          {/* 4 Criteria Form Grid */}
          <div className="space-y-6">
            {recordData.writing.dimensions.map((dim, idx) => (
              <div key={dim.criterion} className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                  <div>
                    <span className="font-bold text-sm text-[#173A55]">
                      {dim.criterion} · {dim.nameZh}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2">({dim.nameEn})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      初评分: {dim.aiScore}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#173A55]">最终得分:</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="9"
                        disabled={isReadOnly}
                        value={dim.teacherScore}
                        onChange={(e) =>
                          handleWritingScoreChange(idx, parseFloat(e.target.value) || 0, dim.teacherFeedback)
                        }
                        className="w-16 px-2 py-1 text-xs font-bold text-[#173A55] border border-slate-300 rounded-md bg-white text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#173A55]">
                      诊断评语 (已预置AI建议初稿，点击可自由修改与确认)：
                    </span>
                    <button
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => handleResetWritingToAi(idx)}
                      className="text-[11px] text-sky-600 hover:text-sky-800 flex items-center gap-1 font-medium"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>恢复AI初始建议</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    disabled={isReadOnly}
                    value={dim.teacherFeedback}
                    onChange={(e) =>
                      handleWritingScoreChange(idx, dim.teacherScore, e.target.value)
                    }
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#173A55] bg-white font-sans leading-relaxed"
                  />
                  <div className="text-[10px] text-slate-400">
                    AI初拟依据参考: {dim.aiFeedback}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Speaking Review */}
      {activeTab === 'speaking' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-[#173A55] flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-[#C4A46A]" />
              <span>IELTS 口语听音复核与评语确认</span>
            </h2>
          </div>

          {/* Audited Behaviors Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recordData.speaking.questions.map((q) => (
              <div key={q.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-[#173A55] flex items-center justify-between">
                  <span>Part {q.part}</span>
                  <span className="text-[10px] text-slate-400">时长: {q.userAudioDurationSeconds}s</span>
                </div>
                <div className="space-y-1 text-slate-600 text-[11px]">
                  <div>播放考官音频: <strong>{q.promptPlayCount}</strong> 次</div>
                  <div>查看文字题干: <strong>{q.transcriptOpened ? `是 (${q.transcriptViewCount}次)` : '否 (完全盲听)'}</strong></div>
                </div>
                <div className="pt-1">
                  <p className="text-[11px] text-slate-500 italic line-clamp-2">
                    "{q.userTranscript}"
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 4 Criteria Form Grid */}
          <div className="space-y-6">
            {recordData.speaking.dimensions.map((dim, idx) => (
              <div key={dim.criterion} className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                  <div>
                    <span className="font-bold text-sm text-[#173A55]">
                      {dim.criterion} · {dim.nameZh}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2">({dim.nameEn})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      初评分: {dim.aiScore === null ? 'N/A' : dim.aiScore}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#173A55]">最终得分:</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="9"
                        disabled={isReadOnly}
                        value={dim.teacherScore}
                        onChange={(e) =>
                          handleSpeakingScoreChange(idx, parseFloat(e.target.value) || 0, dim.teacherFeedback)
                        }
                        className="w-16 px-2 py-1 text-xs font-bold text-[#173A55] border border-slate-300 rounded-md bg-white text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#173A55]">
                      诊断评语 (已预置AI初稿与声学点拨，点击直接编辑修改与确认)：
                    </span>
                    <button
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => handleResetSpeakingToAi(idx)}
                      className="text-[11px] text-sky-600 hover:text-sky-800 flex items-center gap-1 font-medium"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>恢复AI初始建议</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    disabled={isReadOnly}
                    value={dim.teacherFeedback}
                    onChange={(e) =>
                      handleSpeakingScoreChange(idx, dim.teacherScore, e.target.value)
                    }
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#173A55] bg-white font-sans leading-relaxed"
                  />
                  <div className="text-[10px] text-slate-400">
                    AI文本分析依据: {dim.aiFeedback}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Listening & Reading Review */}
      {activeTab === 'listening_reading' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Listening Review */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <h3 className="text-sm font-bold text-[#173A55] border-b border-slate-100 pb-2">
              听力单科评语确认 (Listening)
            </h3>
            <div className="text-xs space-y-2">
              <div>客观题正确数: <strong>4 / 5</strong> (重放次数: {recordData.listening.playCount}次)</div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px]">
                <span className="font-bold block mb-1">AI 原始分析:</span>
                {recordData.listeningFeedback.aiSummary}
              </div>
            </div>
            <div className="space-y-1 pt-2">
              <label className="block text-xs font-bold text-[#173A55]">
                最终诊断评语 (AI预置初稿，点击可修改确认)：
              </label>
              <textarea
                rows={4}
                disabled={isReadOnly}
                value={recordData.listeningFeedback.teacherFeedback}
                onChange={(e) =>
                  setRecordData({
                    ...recordData,
                    listeningFeedback: {
                      ...recordData.listeningFeedback,
                      teacherFeedback: e.target.value,
                    },
                  })
                }
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-sans leading-relaxed"
              />
            </div>
          </div>

          {/* Reading Review */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <h3 className="text-sm font-bold text-[#173A55] border-b border-slate-100 pb-2">
              阅读单科评语确认 (Reading)
            </h3>
            <div className="text-xs space-y-2">
              <div>客观题正确数: <strong>5 / 5</strong> (全对)</div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px]">
                <span className="font-bold block mb-1">AI 原始分析:</span>
                {recordData.readingFeedback.aiSummary}
              </div>
            </div>
            <div className="space-y-1 pt-2">
              <label className="block text-xs font-bold text-[#173A55]">
                最终诊断评语 (AI预置初稿，点击可修改确认)：
              </label>
              <textarea
                rows={4}
                disabled={isReadOnly}
                value={recordData.readingFeedback.teacherFeedback}
                onChange={(e) =>
                  setRecordData({
                    ...recordData,
                    readingFeedback: {
                      ...recordData.readingFeedback,
                      teacherFeedback: e.target.value,
                    },
                  })
                }
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-sans leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
