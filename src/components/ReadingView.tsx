import React, { useState } from 'react';
import { AssessmentRecord, Language, ReadingQuestion } from '../types/assessment';
import { translations } from '../utils/i18n';
import { 
  ArrowLeft, 
  Highlighter, 
  Flag, 
  CheckCircle, 
  RotateCcw, 
  FileCheck,
  HelpCircle,
  Bookmark
} from 'lucide-react';

interface ReadingViewProps {
  record: AssessmentRecord;
  lang: Language;
  onBack: () => void;
  onSave: (updatedRecord: AssessmentRecord) => void;
}

export const ReadingView: React.FC<ReadingViewProps> = ({
  record,
  lang,
  onBack,
  onSave,
}) => {
  const t = translations[lang];
  const [questions, setQuestions] = useState<ReadingQuestion[]>(record.reading.questions);
  const [activeQuestionId, setActiveQuestionId] = useState<number>(1);
  const [flaggedIds, setFlaggedIds] = useState<number[]>([]);
  const [highlights, setHighlights] = useState<string[]>(record.reading.highlightedSnippets || []);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const toggleFlag = (id: number) => {
    setFlaggedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAnswerChange = (qId: number, val: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          const isCorrect = val.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
          return { ...q, userAnswer: val, isCorrect };
        }
        return q;
      })
    );
  };

  // Add highlighted text from user selection
  const handleHighlightSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 3) {
      const text = selection.toString().trim();
      if (!highlights.includes(text)) {
        setHighlights([...highlights, text]);
      }
      selection.removeAllRanges();
    }
  };

  const clearHighlights = () => {
    setHighlights([]);
  };

  const handleRestoreSample = () => {
    setQuestions(record.reading.questions);
  };

  const handleClear = () => {
    setQuestions((prev) => prev.map((q) => ({ ...q, userAnswer: '', isCorrect: false })));
  };

  const handleSubmit = () => {
    const updatedRecord: AssessmentRecord = {
      ...record,
      reading: {
        ...record.reading,
        status: 'submitted',
        questions,
        highlightedSnippets: highlights,
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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      {/* Top Bar with back, highlighter toggle & status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#173A55] font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToHub}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleHighlightSelection}
            className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#8C6D3B] font-semibold border border-amber-300 flex items-center gap-1.5 transition"
            title="划选左侧文章文字后点击此按钮高亮"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>选中文本添加高亮</span>
          </button>
          {highlights.length > 0 && (
            <button
              onClick={clearHighlights}
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              清除高亮 ({highlights.length})
            </button>
          )}
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
            {t.statusSubmitted}
          </span>
        </div>
      </div>

      {/* Split-Screen IELTS Layout: Left Article, Right Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* Left Column: Academic Reading Passage */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 overflow-y-auto max-h-[750px] space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[11px] font-bold text-[#C4A46A] tracking-wider uppercase">
              Reading Passage 1 · Academic Diagnostic
            </span>
            <h1 className="text-xl font-serif font-bold text-[#173A55] mt-1">
              {record.reading.passageTitle}
            </h1>
            <p className="text-xs text-slate-500 mt-1 italic">
              {record.reading.passageSubtitle}
            </p>
          </div>

          <div className="space-y-4 text-sm text-slate-700 leading-relaxed font-sans">
            {record.reading.passageParagraphs.map((para) => (
              <div key={para.label} className="relative pl-7">
                <span className="absolute left-0 top-0.5 w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center border border-slate-200">
                  {para.label}
                </span>
                <p>
                  {para.text}
                </p>
              </div>
            ))}
          </div>

          {/* Highlighted notes indicator */}
          {highlights.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs text-amber-900 space-y-1">
              <span className="font-semibold flex items-center gap-1 text-[11px]">
                <Highlighter className="w-3.5 h-3.5 text-amber-600" />
                当前标记的高亮线索 ({highlights.length} 条)：
              </span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-800">
                {highlights.map((h, i) => (
                  <li key={i} className="line-clamp-1 italic">
                    "{h}"
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Questions & Navigation */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between max-h-[750px] overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-[#173A55] uppercase tracking-wider">
                Questions 1–5
              </span>
              <button
                onClick={() => toggleFlag(activeQuestionId)}
                className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1 transition ${
                  flaggedIds.includes(activeQuestionId)
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Flag className="w-3 h-3 text-[#C4A46A]" />
                <span>{flaggedIds.includes(activeQuestionId) ? t.flagged : t.flagQuestion}</span>
              </button>
            </div>

            {/* Current Active Question Display */}
            {(() => {
              const currentQ = questions.find((q) => q.id === activeQuestionId) || questions[0];
              return (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">
                      Question {currentQ.id} of {questions.length}
                    </span>
                    <p className="text-xs text-slate-500 italic">
                      {currentQ.instruction}
                    </p>
                    <p className="text-sm font-semibold text-slate-800 pt-2">
                      {currentQ.question}
                    </p>
                  </div>

                  {/* Options: TRUE / FALSE / NOT GIVEN */}
                  {currentQ.type === 'true_false_not_given' && (
                    <div className="space-y-2 pt-2">
                      {['TRUE', 'FALSE', 'NOT GIVEN'].map((opt) => (
                        <label
                          key={opt}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                            currentQ.userAnswer === opt
                              ? 'border-[#173A55] bg-sky-50 font-bold text-[#173A55]'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`rq-${currentQ.id}`}
                            value={opt}
                            checked={currentQ.userAnswer === opt}
                            onChange={() => handleAnswerChange(currentQ.id, opt)}
                            className="text-[#173A55] focus:ring-[#173A55]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Options: Summary Completion (Text Input) */}
                  {currentQ.type === 'summary_completion' && (
                    <div className="pt-2">
                      <input
                        type="text"
                        value={currentQ.userAnswer}
                        onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                        placeholder="从原文中提取填空词..."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#173A55] bg-white font-medium"
                      />
                    </div>
                  )}

                  {/* Options: Multiple Choice */}
                  {currentQ.type === 'multiple_choice' && currentQ.options && (
                    <div className="space-y-2 pt-2">
                      {currentQ.options.map((opt) => (
                        <label
                          key={opt}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                            currentQ.userAnswer === opt
                              ? 'border-[#173A55] bg-sky-50 font-bold text-[#173A55]'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`rq-${currentQ.id}`}
                            value={opt}
                            checked={currentQ.userAnswer === opt}
                            onChange={() => handleAnswerChange(currentQ.id, opt)}
                            className="text-[#173A55] focus:ring-[#173A55] mt-0.5"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Answer Analysis Box */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1 mt-4">
                    <div className="text-[11px]">
                      参考正确答案: <strong className="text-emerald-700">{currentQ.correctAnswer}</strong>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      解题逻辑: {currentQ.explanation}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Bottom Question Jump Bar */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">题号定位导航:</span>
              <div className="flex items-center gap-1.5">
                {questions.map((q) => {
                  const isAnswered = q.userAnswer.trim().length > 0;
                  const isFlagged = flaggedIds.includes(q.id);
                  const isActive = q.id === activeQuestionId;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setActiveQuestionId(q.id)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold relative transition flex items-center justify-center ${
                        isActive
                          ? 'bg-[#173A55] text-white ring-2 ring-amber-400'
                          : isAnswered
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {q.id}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submitting controls */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRestoreSample}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                >
                  {t.restoreSample}
                </button>
                <button
                  onClick={handleClear}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                >
                  {t.clearAnswers}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {submittedNotice && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    已更新
                  </span>
                )}
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-xl bg-[#173A55] hover:bg-[#204C6E] text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  <FileCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t.submitSubject}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
