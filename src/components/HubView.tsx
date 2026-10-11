import React from 'react';
import { AssessmentRecord, Language } from '../types/assessment';
import { translations } from '../utils/i18n';
import { 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Award,
  AlertCircle,
  UserCheck
} from 'lucide-react';

interface HubViewProps {
  record: AssessmentRecord;
  lang: Language;
  onSelectSubject: (subject: 'listening' | 'reading' | 'writing' | 'speaking') => void;
  onSubmitComprehensive: () => void;
  onNavigateReport: () => void;
  onNavigateProfile: () => void;
}

export const HubView: React.FC<HubViewProps> = ({
  record,
  lang,
  onSelectSubject,
  onSubmitComprehensive,
  onNavigateReport,
  onNavigateProfile,
}) => {
  const t = translations[lang];

  const subjects = [
    {
      id: 'listening' as const,
      name: t.listening,
      icon: Headphones,
      descZh: '校园设施与可再生能源场景 · 5道原创题目 · 音频自由重放并记录次数',
      descEn: 'Campus facilities & solar initiative · 5 diagnostic questions · Free replay logged',
      status: record.listening.status,
      timeZh: '约 6 分钟',
      timeEn: 'approx. 6 mins',
      color: 'border-sky-500/30 hover:border-sky-500',
      iconBg: 'bg-sky-50 text-sky-600',
    },
    {
      id: 'reading' as const,
      name: t.reading,
      icon: BookOpen,
      descZh: '现代亲自然建筑演化语篇 · 左右分栏机考布局 · 划词高亮工具与题号导航',
      descEn: 'Biophilic Architecture passage · Split-screen layout · Highlighter tool',
      status: record.reading.status,
      timeZh: '约 8 分钟',
      timeEn: 'approx. 8 mins',
      color: 'border-emerald-500/30 hover:border-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'writing' as const,
      name: t.writing,
      icon: PenTool,
      descZh: 'Task 2 核心议论文 (AI教育与人类导师) · 实时字数统计 · 官方四维诊断 (Task 1 不测)',
      descEn: 'Task 2 Discursive Essay · Live word count · 4 IELTS criteria (Task 1 N/A)',
      status: record.writing.status,
      timeZh: '约 10 分钟',
      timeEn: 'approx. 10 mins',
      color: 'border-amber-500/30 hover:border-amber-500',
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'speaking' as const,
      name: t.speaking,
      icon: Mic,
      descZh: 'Part 1/2/3 语音播题 (默认隐藏文字) · 麦克风录制回放 · 记录文字辅助频次',
      descEn: 'Part 1/2/3 Audio prompts (hidden text) · Mic record/playback · Reveal auditor',
      status: record.speaking.status,
      timeZh: '约 5 分钟',
      timeEn: 'approx. 5 mins',
      color: 'border-purple-500/30 hover:border-purple-500',
      iconBg: 'bg-purple-50 text-purple-600',
    },
  ];

  const completedCount = subjects.filter((s) => s.status === 'submitted').length;
  const isAllDone = completedCount === 4;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Student Profile Quick Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#173A55]">
                {record.student.name} ({record.student.enName})
              </h2>
              <span className="bg-amber-100 text-[#8C6D3B] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                目标总分: Band {record.student.targetOverall}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {record.student.currentLevel} · 每周投入: {record.student.weeklyHours} 小时 · 计划考试: {record.student.examMonth}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={onNavigateProfile}
            className="text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition"
          >
            编辑考生信息
          </button>
          <button
            onClick={onNavigateReport}
            className="flex-1 md:flex-none text-xs px-4 py-2 rounded-lg bg-[#C4A46A] hover:bg-[#b09057] text-[#173A55] font-bold shadow-sm flex items-center justify-center gap-1.5 transition"
          >
            <Award className="w-4 h-4" />
            <span>直达诊断报告</span>
          </button>
        </div>
      </div>

      {/* Hub Hero & Explanation */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold text-[#173A55]">
          {t.hubTitle}
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          {t.hubSubtitle}
        </p>
      </div>

      {/* Submission Status Alert */}
      {record.comprehensiveSubmitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-emerald-800">
              {t.alreadySubmittedNotice}
            </p>
          </div>
          <button
            onClick={onNavigateReport}
            className="text-xs whitespace-nowrap bg-emerald-600 text-white font-semibold px-3.5 py-2 rounded-lg hover:bg-emerald-700 transition shadow-sm flex items-center gap-1"
          >
            <span>{t.navReport}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((sub) => {
          const Icon = sub.icon;
          const isSubmitted = sub.status === 'submitted';

          return (
            <div
              key={sub.id}
              className={`bg-white rounded-2xl p-6 border-2 transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${sub.color}`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${sub.iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#173A55]">
                        {sub.name}
                      </h3>
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {lang === 'zh' ? sub.timeZh : sub.timeEn}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isSubmitted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.statusSubmitted}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {t.statusNotStarted}
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                  {lang === 'zh' ? sub.descZh : sub.descEn}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {isSubmitted ? '已预置高质量示范作答' : '尚未开始答题'}
                </span>
                <button
                  onClick={() => onSelectSubject(sub.id)}
                  className={`text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                    isSubmitted
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-[#173A55] text-white hover:bg-[#204C6E]'
                  }`}
                >
                  <span>{isSubmitted ? t.reviewSubmitted : t.enterSubject}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comprehensive Submission Section */}
      <div className="bg-gradient-to-br from-[#173A55] to-[#0F273B] text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 border border-[#C4A46A]/30">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-5 h-5 text-[#C4A46A]" />
            <h3 className="text-xl font-serif font-bold text-amber-100">
              {t.submitComprehensive}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            {t.submitComprehensiveHint}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-amber-300/80 pt-1">
            <span>四科进度: {completedCount} / 4</span>
            <span>·</span>
            <span>当前默认已全部预填示范作答</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            disabled={!isAllDone}
            onClick={onSubmitComprehensive}
            className={`px-6 py-3 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${
              isAllDone
                ? 'bg-[#C4A46A] hover:bg-[#b5955b] text-[#173A55] cursor-pointer'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.submitComprehensive}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
