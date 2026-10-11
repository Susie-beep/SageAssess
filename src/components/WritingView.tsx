import React, { useState } from 'react';
import { AssessmentRecord, Language } from '../types/assessment';
import { translations } from '../utils/i18n';
import { 
  ArrowLeft, 
  PenTool, 
  FileCheck, 
  RotateCcw, 
  AlertCircle, 
  HelpCircle, 
  CheckCircle,
  FileText
} from 'lucide-react';

interface WritingViewProps {
  record: AssessmentRecord;
  lang: Language;
  onBack: () => void;
  onSave: (updatedRecord: AssessmentRecord) => void;
}

export const WritingView: React.FC<WritingViewProps> = ({
  record,
  lang,
  onBack,
  onSave,
}) => {
  const t = translations[lang];
  const [essay, setEssay] = useState<string>(record.writing.userEssay);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  // Calculate word count cleanly
  const countWords = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  };

  const wordCount = countWords(essay);

  const handleRestoreSample = () => {
    setEssay(record.writing.userEssay);
  };

  const handleClear = () => {
    setEssay('');
  };

  const handleSubmit = () => {
    const updatedRecord: AssessmentRecord = {
      ...record,
      writing: {
        ...record.writing,
        userEssay: essay,
        wordCount,
        status: 'submitted',
        submittedAt: new Date().toLocaleString(),
      },
    };
    onSave(updatedRecord);
    setSubmittedNotice(true);
    setTimeout(() => {
      setSubmittedNotice(false);
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#173A55] font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToHub}</span>
        </button>

        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
          {t.statusSubmitted}
        </span>
      </div>

      {/* Task Prompt Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#C4A46A] tracking-wider uppercase border-b border-slate-100 pb-2">
          <PenTool className="w-4 h-4" />
          <span>{t.task2Title}</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-sm font-medium text-slate-800 leading-relaxed font-sans">
          <p className="font-semibold text-[#173A55] mb-1">Writing Task 2 Prompt:</p>
          <p>"{record.writing.promptTask2}"</p>
          <div className="mt-3 text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
            <span>• Give reasons for your answer and include any relevant examples.</span>
            <span>• Write at least 250 words.</span>
          </div>
        </div>

        {/* Task 1 Notice per PRD */}
        <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#C4A46A] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">{t.task1Disclaimer}</span>
          </div>
        </div>
      </div>

      {/* Essay Editor Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-sm font-bold text-[#173A55] flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>考生作答区 (Candidate Response)</span>
          </span>

          {/* Word Count Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                wordCount >= 250
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              {t.wordCount}: {wordCount} 词 (建议 250+ 词)
            </div>
          </div>
        </div>

        <textarea
          rows={14}
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder={t.essayPlaceholder}
          className="w-full p-4 text-sm font-sans text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#173A55] bg-slate-50/30 leading-relaxed resize-y"
        />

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestoreSample}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition"
            >
              {t.restoreSample}
            </button>
            <button
              onClick={handleClear}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition"
            >
              {t.clearAnswers}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {submittedNotice && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                作文已保存
              </span>
            )}
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-[#173A55] hover:bg-[#204C6E] text-white font-bold text-xs shadow-sm transition flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4 text-amber-300" />
              <span>{t.submitSubject}</span>
            </button>
          </div>
        </div>
      </div>

      {/* IELTS 4 Assessment Criteria Educational Info */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 space-y-3">
        <h3 className="font-bold text-[#173A55] text-xs uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#C4A46A]" />
          <span>IELTS 官方写作四大评分标准 (提交后将由AI初评与教师人工复核)：</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {record.writing.dimensions.map((dim) => (
            <div key={dim.criterion} className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
              <span className="font-bold text-[#173A55] block">
                {dim.criterion} · {dim.nameZh}
              </span>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                {dim.aiFeedback}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
