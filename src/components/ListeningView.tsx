import React, { useState, useEffect } from 'react';
import { AssessmentRecord, Language, ListeningQuestion } from '../types/assessment';
import { translations } from '../utils/i18n';
import { 
  ArrowLeft, 
  Play, 
  Square, 
  Volume2, 
  RotateCcw, 
  CheckCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  FileCheck,
  AlertCircle,
  Lock,
  Unlock,
  ShieldAlert
} from 'lucide-react';

interface ListeningViewProps {
  record: AssessmentRecord;
  lang: Language;
  onBack: () => void;
  onSave: (updatedRecord: AssessmentRecord) => void;
}

export const ListeningView: React.FC<ListeningViewProps> = ({
  record,
  lang,
  onBack,
  onSave,
}) => {
  const t = translations[lang];
  const isInitiallySubmitted = record.listening.status === 'submitted';
  const [isSubmitted, setIsSubmitted] = useState<boolean>(isInitiallySubmitted);
  const [isPlaying, setIsPlaying] = useState(false);
  // In test mode, candidate can only play once. If already submitted, free replay is unlocked.
  const [hasPlayedInExam, setHasPlayedInExam] = useState<boolean>(isInitiallySubmitted);
  const [playCount, setPlayCount] = useState<number>(record.listening.playCount || (isInitiallySubmitted ? 1 : 0));
  const [questions, setQuestions] = useState<ListeningQuestion[]>(record.listening.questions);
  const [showScript, setShowScript] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  // Web Speech Synthesis for audio playback
  const handlePlayAudio = () => {
    // If not submitted and already played, prevent replay!
    if (!isSubmitted && hasPlayedInExam && !isPlaying) {
      alert('严格机考规则：做题期间听力录音仅限播放一次，不支持重放。提交答卷后方可重听复习。');
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert('您的浏览器不支持语音合成播放，已为您模拟播放。');
      setPlayCount((prev) => prev + 1);
      setHasPlayedInExam(true);
      return;
    }

    if (isPlaying) {
      if (!isSubmitted) {
        // In exam mode, stopping is discouraged/disabled, but if user explicitly stops, it counts as played
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setHasPlayedInExam(true);
      } else {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      }
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(record.listening.audioScript);
    utterance.lang = 'en-GB';
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setIsPlaying(true);
      setPlayCount((prev) => prev + 1);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setHasPlayedInExam(true);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setHasPlayedInExam(true);
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

  const handleRestoreSample = () => {
    setQuestions(record.listening.questions);
    setIsSubmitted(true);
    setHasPlayedInExam(true);
    setPlayCount(1);
  };

  const handleClearToRetest = () => {
    // Reset to pure exam mode
    setQuestions((prev) => prev.map((q) => ({ ...q, userAnswer: '', isCorrect: false })));
    setIsSubmitted(false);
    setHasPlayedInExam(false);
    setPlayCount(0);
    setShowScript(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const updatedRecord: AssessmentRecord = {
      ...record,
      listening: {
        ...record.listening,
        status: 'submitted',
        playCount: Math.max(1, playCount),
        questions,
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
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#173A55] font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToHub}</span>
        </button>

        <div className="flex items-center gap-2">
          {isSubmitted ? (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.statusSubmitted} · 已解锁重听与原文</span>
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-semibold border border-amber-200 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>考试作答中 (禁止重放/锁定原文)</span>
            </span>
          )}
        </div>
      </div>

      {/* Title & Instructions Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#173A55] flex items-center gap-2">
              <Volume2 className="w-6 h-6 text-[#C4A46A]" />
              <span>{t.listening}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Part 2: Campus Environmental Initiative & Volunteer Briefing
            </p>
          </div>

          {/* Audio Player Controls */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            {/* Audio Button Behavior according to exam status */}
            {!isSubmitted ? (
              // Exam Mode: Only 1 play allowed!
              hasPlayedInExam && !isPlaying ? (
                <button
                  disabled
                  className="px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                  title="机考规则：做题期间不可重放，提交后方可重听"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t.audioPlayedOnce}</span>
                </button>
              ) : isPlaying ? (
                <button
                  onClick={handlePlayAudio}
                  className="px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                >
                  <Square className="w-3.5 h-3.5 animate-pulse" />
                  <span>{t.playingAudioBtn} (点此停止)</span>
                </button>
              ) : (
                <button
                  onClick={handlePlayAudio}
                  className="px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 bg-[#173A55] hover:bg-[#204C6E] text-white shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t.playAudioBtn}</span>
                </button>
              )
            ) : (
              // Post-Submission Mode: Free replay unlocked!
              <button
                onClick={handlePlayAudio}
                className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 shadow-sm transition ${
                  isPlaying
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>{t.stopAudioBtn}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-amber-200" />
                    <span>{t.replayAudioBtn}</span>
                  </>
                )}
              </button>
            )}

            <div className="text-xs text-slate-600 border-l border-slate-200 pl-3">
              <div className="font-semibold text-[#173A55]">
                {t.audioPlayCount}: <span className="text-amber-600 font-bold">{playCount}</span> 次
              </div>
              <div className="text-[10px] text-slate-400">
                {isSubmitted ? '已解锁复习重听' : '单次播放受限'}
              </div>
            </div>
          </div>
        </div>

        {/* Rule Banner */}
        <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
          isSubmitted 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50/80 border-amber-300 text-amber-950'
        }`}>
          <ShieldAlert className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isSubmitted ? 'text-emerald-600' : 'text-amber-600'}`} />
          <div>
            <p className="font-bold">
              {isSubmitted ? t.listenPostSubmitHint : t.listenExamRule}
            </p>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isSubmitted 
                ? '您已提交本单科，现在可以随时重听录音、比对参考答案并自查听力文本。'
                : '真实雅思机考听力不提供重播，答题过程中亦不可翻看原文。请认真听音作答，完成并点击“提交本单科作答”后即可解锁原文及重听功能。'}
            </p>
          </div>
        </div>

        {/* Transcript Section: Locked during exam, Unlocked after submission */}
        <div>
          {!isSubmitted ? (
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.audioTranscriptLocked}</span>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setShowScript(!showScript)}
                className="text-xs text-slate-600 hover:text-[#173A55] flex items-center gap-1.5 font-semibold transition bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
              >
                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.audioTranscriptUnlocked}</span>
                {showScript ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showScript && (
                <div className="mt-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 italic leading-relaxed">
                  "{record.listening.audioScript}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-6">
        <h2 className="text-base font-bold text-[#173A55] border-b border-slate-100 pb-3 flex items-center justify-between">
          <span>Questions 1–5</span>
          <span className="text-xs font-normal text-slate-400">
            答题模式：点选或输入答案
          </span>
        </h2>

        <div className="space-y-6">
          {questions.map((q) => (
            <div
              key={q.id}
              className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/40 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider">
                  Question {q.id} · {q.type === 'multiple_choice' ? '单项选择' : '填空题'}
                </span>
                <span className="text-[11px] text-slate-400">{q.instruction}</span>
              </div>

              <p className="text-sm font-medium text-slate-800">
                {q.question}
              </p>

              {/* Multiple Choice Options */}
              {q.type === 'multiple_choice' && q.options && (
                <div className="space-y-2 pt-1">
                  {q.options.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        q.userAnswer === opt
                          ? 'border-[#173A55] bg-sky-50/70 font-semibold text-[#173A55]'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt}
                        checked={q.userAnswer === opt}
                        onChange={() => handleAnswerChange(q.id, opt)}
                        className="text-[#173A55] focus:ring-[#173A55]"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Fill in Blank Input */}
              {q.type === 'fill_blank' && (
                <div className="pt-1">
                  <input
                    type="text"
                    value={q.userAnswer}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="在此输入单词或数字..."
                    className="w-full sm:w-80 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#173A55] bg-white font-medium"
                  />
                </div>
              )}

              {/* Reference Answer Analysis (Only shown after submission!) */}
              {isSubmitted && (
                <div className="pt-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-500 border-t border-slate-100">
                  <span className="text-[11px]">
                    参考答案: <strong className="text-emerald-700">{q.correctAnswer}</strong>
                  </span>
                  <span className="text-[11px] text-slate-400 italic">
                    解析: {q.explanation}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestoreSample}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition"
            >
              {t.restoreSample}
            </button>
            <button
              onClick={handleClearToRetest}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition flex items-center gap-1"
              title="清空答题重新进入严格机考单次播放模式"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>{t.clearAnswers}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {submittedNotice && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                已提交！重听与原文已解锁
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
    </div>
  );
};
