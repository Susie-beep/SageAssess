import React, { useState, useEffect, useRef } from 'react';
import { AssessmentRecord, Language, SpeakingQuestion } from '../types/assessment';
import { translations } from '../utils/i18n';
import { 
  ArrowLeft, 
  Mic, 
  Square, 
  Play, 
  Volume2, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  FileCheck, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  Radio
} from 'lucide-react';

interface SpeakingViewProps {
  record: AssessmentRecord;
  lang: Language;
  onBack: () => void;
  onSave: (updatedRecord: AssessmentRecord) => void;
}

export const SpeakingView: React.FC<SpeakingViewProps> = ({
  record,
  lang,
  onBack,
  onSave,
}) => {
  const t = translations[lang];
  const [questions, setQuestions] = useState<SpeakingQuestion[]>(record.speaking.questions);
  const [activePartId, setActivePartId] = useState<number>(1);
  const [isPlayingPrompt, setIsPlayingPrompt] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  // Clean speech synthesis
  const handlePlayPrompt = (text: string, qId: number) => {
    if (!('speechSynthesis' in window)) {
      alert('您的浏览器不支持语音播放，已为您模拟记录播放。');
      setQuestions((prev) =>
        prev.map((q) => (q.id === qId ? { ...q, promptPlayCount: q.promptPlayCount + 1 } : q))
      );
      return;
    }

    if (isPlayingPrompt) {
      window.speechSynthesis.cancel();
      setIsPlayingPrompt(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setIsPlayingPrompt(true);
      setQuestions((prev) =>
        prev.map((q) => (q.id === qId ? { ...q, promptPlayCount: q.promptPlayCount + 1 } : q))
      );
    };

    utterance.onend = () => {
      setIsPlayingPrompt(false);
    };

    utterance.onerror = () => {
      setIsPlayingPrompt(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Toggle reveal question transcript
  const toggleTranscript = (qId: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          const willOpen = !q.transcriptOpened;
          return {
            ...q,
            transcriptOpened: willOpen,
            transcriptViewCount: willOpen ? q.transcriptViewCount + 1 : q.transcriptViewCount,
          };
        }
        return q;
      })
    );
  };

  // Real in-browser microphone recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission not granted or unavailable:', err);
      // Fallback demo recording simulation
      setIsRecording(true);
      setRecordDuration(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
  };

  const handleRestoreSample = () => {
    setQuestions(record.speaking.questions);
  };

  const handleSubmit = () => {
    const updatedRecord: AssessmentRecord = {
      ...record,
      speaking: {
        ...record.speaking,
        status: 'submitted',
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

  const currentQ = questions.find((q) => q.id === activePartId) || questions[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Bar */}
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

      {/* Title & Instructions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#173A55] flex items-center gap-2">
              <Mic className="w-6 h-6 text-[#C4A46A]" />
              <span>{t.speaking}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Part 1 / Part 2 / Part 3 全环节口语互动诊断
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {questions.map((q) => (
              <button
                key={q.id}
                onClick={() => setActivePartId(q.id)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activePartId === q.id
                    ? 'bg-[#173A55] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Part {q.part}
              </button>
            ))}
          </div>
        </div>

        {/* Auditor & Hidden Transcript Banner */}
        <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#C4A46A] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">{t.speakingNotice}</span>
            <p className="text-[11px] text-amber-800/80 mt-0.5">
              {t.speakingHiddenHint}
            </p>
          </div>
        </div>
      </div>

      {/* Active Part Interaction Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-[#C4A46A] tracking-wider uppercase">
              {currentQ.partTitle}
            </span>
            <h2 className="text-base font-bold text-[#173A55] mt-0.5">
              考官语音提问 (Examiner Audio Prompt)
            </h2>
          </div>

          {/* Prompt Voice Player */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePlayPrompt(currentQ.questionText, currentQ.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition ${
                isPlayingPrompt
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-[#173A55] hover:bg-[#204C6E] text-white'
              }`}
            >
              {isPlayingPrompt ? (
                <>
                  <Square className="w-3.5 h-3.5" />
                  <span>停止播放</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>点击播放考官提问</span>
                </>
              )}
            </button>

            <span className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              已播放: <strong className="text-amber-600">{currentQ.promptPlayCount}</strong> 次
            </span>
          </div>
        </div>

        {/* Question Text Box (HIDDEN BY DEFAULT) */}
        <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              {currentQ.transcriptOpened ? <Eye className="w-3.5 h-3.5 text-sky-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
              <span>题目文字版状态：{currentQ.transcriptOpened ? '已展开' : '已隐藏 (推荐盲听)'}</span>
            </span>

            <button
              onClick={() => toggleTranscript(currentQ.id)}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-[#173A55] shadow-2xs transition"
            >
              {currentQ.transcriptOpened ? t.hideTranscriptBtn : t.viewTranscriptBtn}
            </button>
          </div>

          {currentQ.transcriptOpened ? (
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-sm font-semibold text-slate-800 leading-relaxed font-sans">
              "{currentQ.questionText}"
            </div>
          ) : (
            <div className="p-4 bg-slate-100/60 rounded-lg border border-slate-200/60 text-center text-xs text-slate-400 italic">
              ••• 题目文字已隐藏。请先点击上方“播放考官提问”进行盲听。若需要可随时点击右侧按钮查看文字版 •••
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>文字展开次数: {currentQ.transcriptViewCount} 次</span>
            <span>该记录将在教师复核时披露</span>
          </div>
        </div>

        {/* Candidate Audio Recording & Response */}
        <div className="p-5 rounded-2xl bg-sky-50/40 border border-sky-200/70 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[#173A55] uppercase tracking-wider block">
                考生回答录音与转写 (Candidate Spoken Answer)
              </span>
              <span className="text-[11px] text-slate-500">
                录音时长: {currentQ.userAudioDurationSeconds} 秒
              </span>
            </div>

            {/* Mic Recording Controls */}
            <div className="flex items-center gap-2">
              {isRecording ? (
                <button
                  onClick={handleStopRecording}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 animate-pulse flex items-center gap-2 shadow-sm"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>停止录音 ({recordDuration}s)</span>
                </button>
              ) : (
                <button
                  onClick={handleStartRecording}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 flex items-center gap-2 shadow-sm"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{t.recordMyVoice}</span>
                </button>
              )}
            </div>
          </div>

          {/* Pre-recorded/Recorded Audio Playback Bar */}
          <div className="bg-white p-3 rounded-xl border border-sky-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-100 text-[#173A55] flex items-center justify-center font-bold">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {recordedAudioUrl ? '已录制音频片段' : '预置高品质示范音频 (Wang Chen)'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {recordedAudioUrl ? `录音时长 ${recordDuration}s` : '可供教师端回放复核连读与发音'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                // Play spoken transcript using TTS or recorded blob
                if (recordedAudioUrl) {
                  const audio = new Audio(recordedAudioUrl);
                  audio.play();
                } else {
                  handlePlayPrompt(currentQ.userTranscript, currentQ.id);
                }
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-sky-50 text-[#173A55] font-semibold border border-sky-300 hover:bg-sky-100 flex items-center gap-1.5 transition"
            >
              <Play className="w-3.5 h-3.5" />
              <span>回放回答音频</span>
            </button>
          </div>

          {/* Transcript display */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">
              {t.studentSpokenTranscript}:
            </span>
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans italic">
              "{currentQ.userTranscript}"
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={handleRestoreSample}
            className="text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition"
          >
            {t.restoreSample}
          </button>

          <div className="flex items-center gap-3">
            {submittedNotice && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                口语作答已更新
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

      {/* IELTS 4 Speaking Criteria Educational Info */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 space-y-3">
        <h3 className="font-bold text-[#173A55] text-xs uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#C4A46A]" />
          <span>IELTS 官方口语四大评分维度说明：</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {record.speaking.dimensions.map((dim) => (
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
