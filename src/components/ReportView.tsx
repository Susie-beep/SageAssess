import React from 'react';
import { AssessmentRecord, Language } from '../types/assessment';
import { translations } from '../utils/i18n';
import { 
  Printer, 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  BookOpen, 
  Headphones, 
  PenTool, 
  Mic, 
  Target,
  FileCheck,
  ShieldCheck
} from 'lucide-react';

interface ReportViewProps {
  record: AssessmentRecord;
  lang: Language;
  onBackToHub: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  record,
  lang,
  onBackToHub,
}) => {
  const t = translations[lang];

  // If there's an officially published snapshot, use it; otherwise use the current draft/preview
  const isPublished = record.taskStatus === 'published' && record.publishedReportSnapshot !== null;
  const overall = isPublished ? record.publishedReportSnapshot! : record.overall;

  const handlePrint = () => {
    window.print();
  };

  // Radar chart coordinates computation (center at 140,140, radius 90)
  const skills = [
    { name: 'Listening', value: overall.listeningBand, max: 9, target: record.student.targetListening },
    { name: 'Reading', value: overall.readingBand, max: 9, target: record.student.targetReading },
    { name: 'Writing', value: overall.writingBand, max: 9, target: record.student.targetWriting },
    { name: 'Speaking', value: overall.speakingBand, max: 9, target: record.student.targetSpeaking },
  ];

  const center = 140;
  const radius = 90;

  const getCoordinates = (index: number, total: number, val: number, maxVal: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = (val / maxVal) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const actualPoints = skills.map((s, i) => {
    const { x, y } = getCoordinates(i, skills.length, s.value, 9);
    return `${x},${y}`;
  }).join(' ');

  const targetPoints = skills.map((s, i) => {
    const { x, y } = getCoordinates(i, skills.length, s.target, 9);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 print:p-0 print:max-w-full">
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={onBackToHub}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#173A55] font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToHub}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#173A55] hover:bg-[#204C6E] text-white font-bold text-xs shadow-sm flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4 text-[#C4A46A]" />
            <span>{t.printPdfBtn}</span>
          </button>
        </div>
      </div>

      {/* Main Report Document Container */}
      <div className="bg-white rounded-3xl shadow-md border border-slate-200/90 overflow-hidden print-page">
        {/* Report Top Header */}
        <div className="bg-gradient-to-r from-[#0F273B] via-[#173A55] to-[#204C6E] text-white p-6 sm:p-8 border-b-4 border-[#C4A46A]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#C4A46A] text-[#173A55] font-serif font-black text-2xl flex items-center justify-center shadow-lg border-2 border-amber-200/40">
                S
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-200 tracking-widest uppercase">
                  {t.reportSubtitle}
                </span>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                  {t.reportTitle}
                </h1>
              </div>
            </div>

            {/* Serial & Version */}
            <div className="text-right text-xs text-slate-300">
              <div>编号: <span className="font-mono text-amber-200 font-bold">{overall.reportId}</span></div>
              <div className="text-[11px] text-slate-400 mt-0.5">版本: {overall.reportVersion}</div>
            </div>
          </div>

          {/* Student Profile Strip */}
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">学员姓名</span>
              <span className="font-bold text-white text-sm">
                {record.student.name} ({record.student.enName})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">当前英语背景</span>
              <span className="text-slate-200 line-clamp-1">{record.student.currentLevel}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">目标总分 / 考试计划</span>
              <span className="font-bold text-amber-200">
                Band {record.student.targetOverall} · {record.student.examMonth}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">每周投入时间</span>
              <span className="text-slate-200">{record.student.weeklyHours} 小时 / 周</span>
            </div>
          </div>
        </div>

        {/* Report Official Notice Banner */}
        <div className="py-3 px-6 text-xs flex items-center justify-between border-b bg-emerald-50 text-emerald-950 border-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">
              {t.reportConfirmedNotice}
            </span>
          </div>

          <span className="text-[11px] text-slate-500">
            评测核定日期: {overall.publishedAt}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* SECTION 1: Top 4 Metric Cards in a Single Row */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#173A55] uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-[#C4A46A]" />
                <span>四科评测得分 (4-Skills Band Scores)</span>
              </h2>
              <span className="text-[11px] text-slate-400">
                短测诊断评估值 · 供入学分班参考
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Listening Card */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/90 relative overflow-hidden flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-[#173A55]">听力 Listening</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">4/5 题正确</span>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-serif font-bold text-[#173A55]">
                      {overall.listeningBand.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400">/ 9.0</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    目标: Band {record.student.targetListening.toFixed(1)}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 line-clamp-2">
                  信息捕捉敏锐，针对学术讲座长句路标词需深度抓取。
                </div>
              </div>

              {/* Reading Card */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/90 relative overflow-hidden flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-[#173A55]">阅读 Reading</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold">5/5 满分</span>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-serif font-bold text-[#173A55]">
                      {overall.readingBand.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400">/ 9.0</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    目标: Band {record.student.targetReading.toFixed(1)}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 line-clamp-2">
                  学术词汇扎实，T/F/NG定位极准，具备冲7.5+底蕴。
                </div>
              </div>

              {/* Writing Card */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/90 relative overflow-hidden flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-100 text-[#8C6D3B]">
                      <PenTool className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-[#173A55]">写作 Writing</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Task 2 诊断</span>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-serif font-bold text-[#173A55]">
                      {overall.writingBand.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400">/ 9.0</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    目标: Band {record.student.targetWriting.toFixed(1)}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 line-clamp-2">
                  学术议论闭环完整，高级词汇搭配得体，建议丰富微观例证。
                </div>
              </div>

              {/* Speaking Card */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/90 relative overflow-hidden flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                      <Mic className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-[#173A55]">口语 Speaking</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">全3部分复核</span>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-serif font-bold text-[#173A55]">
                      {overall.speakingBand.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400">/ 9.0</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    目标: Band {record.student.targetSpeaking.toFixed(1)}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 line-clamp-2">
                  语流基本流畅，发音清晰；需强化连读弱读与自然地道小词。
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Overall Score & Radar Comparison Chart */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-200/80">
            {/* Overall Score Box */}
            <div className="md:col-span-5 flex flex-col justify-center space-y-4 border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
              <span className="text-xs font-bold text-[#C4A46A] uppercase tracking-wider">
                综合能力诊断结论
              </span>
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-serif font-black text-[#173A55]">
                    Band {overall.teacherOverallBand.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-[#173A55] bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-300">
                    评测最终得分
                  </span>
                </div>
                <p className="text-xs text-slate-500 pt-1">
                  目标总分: Band {overall.targetOverallBand.toFixed(1)} · 差距: {(overall.targetOverallBand - overall.teacherOverallBand).toFixed(1)} 分
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1 text-xs text-slate-700">
                <div className="font-bold text-[#173A55] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#C4A46A]" />
                  <span>分班与提分规划：</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  当前综合评定为 Band {overall.teacherOverallBand}，基础处于大学英语六级与雅思冲刺阶段。重点攻坚<strong>口语连读语调</strong>与<strong>写作微观实证</strong>，可在既定周期内稳步冲刺目标 Band {overall.targetOverallBand}。
                </p>
              </div>
            </div>

            {/* Visual Radar Capability Chart */}
            <div className="md:col-span-7 flex flex-col items-center justify-center space-y-2">
              <div className="flex items-center gap-6 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#173A55]" />
                  <span className="font-semibold">评测得分</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full border-2 border-amber-500 bg-amber-50" />
                  <span className="font-semibold">目标总分水准</span>
                </div>
              </div>

              {/* Pure SVG Radar Chart */}
              <svg width="280" height="280" viewBox="0 0 280 280" className="overflow-visible">
                {/* Background Grid Circles */}
                {[0.33, 0.66, 1].map((scale, i) => (
                  <circle
                    key={i}
                    cx={center}
                    cy={center}
                    r={radius * scale}
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    strokeDasharray={scale === 1 ? 'none' : '3 3'}
                  />
                ))}

                {/* Axis lines */}
                {skills.map((_, i) => {
                  const { x, y } = getCoordinates(i, skills.length, 9, 9);
                  return (
                    <line
                      key={i}
                      x1={center}
                      y1={center}
                      x2={x}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Target Polygon */}
                <polygon
                  points={targetPoints}
                  fill="rgba(196, 164, 106, 0.15)"
                  stroke="#C4A46A"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Actual Polygon */}
                <polygon
                  points={actualPoints}
                  fill="rgba(23, 58, 85, 0.25)"
                  stroke="#173A55"
                  strokeWidth="2.5"
                />

                {/* Actual Points markers */}
                {skills.map((s, i) => {
                  const { x, y } = getCoordinates(i, skills.length, s.value, 9);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#173A55"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  );
                })}

                {/* Skill Labels */}
                {skills.map((s, i) => {
                  const labelRadius = radius + 24;
                  const angle = (Math.PI * 2 / skills.length) * i - Math.PI / 2;
                  const lx = center + labelRadius * Math.cos(angle);
                  const ly = center + labelRadius * Math.sin(angle);

                  return (
                    <text
                      key={i}
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[11px] font-bold fill-slate-700"
                    >
                      {s.name} ({s.value})
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* SECTION 3: Deep Dive into Criteria - Final Unified Evaluation (No AI/Teacher Mention) */}
          <div className="space-y-6">
            <h2 className="text-base font-bold text-[#173A55] border-b border-slate-200 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#C4A46A]" />
                <span>官方标准各维度深度诊断评价</span>
              </span>
            </h2>

            {/* Writing Criteria Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#173A55] uppercase tracking-wider">
                  Writing Task 2 官方四大维度诊断
                </span>
                <span className="text-[11px] text-slate-400">
                  Task 1 未包含于短测 (标记为 N/A)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {record.writing.dimensions.map((dim) => {
                  // Final unified evaluation text
                  const finalFeedback = dim.teacherFeedback || dim.aiFeedback;
                  const finalScore = dim.teacherScore || dim.aiScore;

                  return (
                    <div key={dim.criterion} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-bold text-[#173A55]">
                          {dim.criterion} · {dim.nameZh}
                        </span>
                        <span className="font-bold text-[#173A55] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                          得分: Band {finalScore.toFixed(1)}
                        </span>
                      </div>

                      <div className="pt-1">
                        <div className="text-[11px] text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                          <strong className="text-[#173A55] font-semibold block mb-0.5">诊断评价与提升指导:</strong>
                          {finalFeedback}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Speaking Criteria Cards */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#173A55] uppercase tracking-wider">
                  Speaking 官方四大维度诊断
                </span>
                <span className="text-[11px] text-slate-400">
                  涵盖发音连读与声学特征判定
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {record.speaking.dimensions.map((dim) => {
                  // Final unified evaluation text
                  const finalFeedback = dim.teacherFeedback || dim.aiFeedback;
                  const finalScore = dim.teacherScore || (dim.aiScore ?? 6.0);

                  return (
                    <div key={dim.criterion} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-bold text-[#173A55]">
                          {dim.criterion} · {dim.nameZh}
                        </span>
                        <span className="font-bold text-[#173A55] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                          得分: Band {finalScore.toFixed(1)}
                        </span>
                      </div>

                      <div className="pt-1">
                        <div className="text-[11px] text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                          <strong className="text-[#173A55] font-semibold block mb-0.5">诊断评价与提升指导:</strong>
                          {finalFeedback}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Listening & Reading Diagnostic Feedback Cards */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-[#173A55] uppercase tracking-wider block">
                听力 & 阅读专项能力诊断
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-bold text-[#173A55]">
                      听力 Listening 专项点拨
                    </span>
                    <span className="font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                      Band {overall.listeningBand.toFixed(1)} (4/5正确)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                    {record.listeningFeedback.teacherFeedback || record.listeningFeedback.aiSummary}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-bold text-[#173A55]">
                      阅读 Reading 专项点拨
                    </span>
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Band {overall.readingBand.toFixed(1)} (5/5满分)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                    {record.readingFeedback.teacherFeedback || record.readingFeedback.aiSummary}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Strengths and Priority Improvement Focus */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>学员核心语言优势 (Strengths)</span>
              </span>
              <ul className="space-y-2 text-xs text-emerald-950">
                {overall.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>优先提分突破口 (Targeted Weaknesses)</span>
              </span>
              <ul className="space-y-2 text-xs text-amber-950">
                {overall.weaknesses.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* SECTION 5: Course Placement & Customized Roadmap */}
          <div className="bg-gradient-to-br from-[#173A55] to-[#0F273B] text-white p-6 sm:p-8 rounded-3xl space-y-6 shadow-md border border-[#C4A46A]/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-bold text-[#C4A46A] tracking-wider uppercase">
                  个性化课程匹配与学习方案
                </span>
                <h3 className="text-xl font-serif font-bold text-white mt-1">
                  {overall.recommendedCourse}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  对应层级: {overall.recommendedCourseLevel} · 预计周期: {overall.estimatedWeeks} (非包过承诺)
                </p>
              </div>

              <div className="bg-white/10 px-4 py-2 rounded-xl text-center border border-white/15">
                <span className="text-[11px] text-slate-300 block">建议每周学习时长</span>
                <span className="text-lg font-bold text-amber-300">{overall.weeklyHoursAdvice} 小时</span>
              </div>
            </div>

            {/* Study Phases */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {overall.studyPhases.map((phase, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="font-bold text-amber-200 text-xs">
                    {phase.phase}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {phase.focus}
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1">
                    安排: {phase.duration}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 6: Official Sign-off Block */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
            <div className="space-y-1">
              <div>
                评估签发人:{' '}
                <strong className="text-[#173A55]">
                  {overall.reviewedByTeacherName}
                </strong>
              </div>
              <div className="text-[11px] text-slate-400">
                审核归档时间: {overall.publishedAt}
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="font-serif font-bold text-[#173A55]">
                赛思国际英语教育 · 雅思学术评估中心
              </div>
              <div className="text-[10px] text-slate-400">
                SAGE ACADEMIC ASSESSMENT DIVISION
              </div>
            </div>
          </div>

          {/* Compliance Disclaimer Footer */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-400 leading-relaxed text-center">
            {t.disclaimerFooter}
          </div>
        </div>
      </div>
    </div>
  );
};
