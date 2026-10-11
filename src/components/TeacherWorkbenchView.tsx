import React from 'react';
import { AssessmentRecord, Language, TeacherId } from '../types/assessment';
import { translations } from '../utils/i18n';
import { 
  GraduationCap, 
  Lock, 
  Unlock, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Edit3, 
  Award,
  AlertTriangle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface TeacherWorkbenchViewProps {
  records: AssessmentRecord[];
  activeTeacherId: TeacherId;
  lang: Language;
  onSelectTeacher: (id: TeacherId) => void;
  onClaimTask: (taskId: string) => void;
  onOpenAudit: (taskId: string) => void;
  onOpenPublishedReport: (taskId: string) => void;
}

export const TeacherWorkbenchView: React.FC<TeacherWorkbenchViewProps> = ({
  records,
  activeTeacherId,
  lang,
  onSelectTeacher,
  onClaimTask,
  onOpenAudit,
  onOpenPublishedReport,
}) => {
  const t = translations[lang];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Teacher Role Header & Switcher Banner */}
      <div className="bg-gradient-to-r from-[#173A55] to-[#204C6E] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-[#C4A46A]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#C4A46A]" />
            <h1 className="text-2xl font-serif font-bold text-amber-100">
              {t.teacherWorkbenchTitle}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            {t.teacherWorkbenchSub}
          </p>
        </div>

        {/* Current Teacher Switcher */}
        <div className="bg-[#0F273B] p-3 rounded-xl border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-xs">
            <div className="text-slate-400">{t.currentTeacher}:</div>
            <div className="font-bold text-amber-200">
              {activeTeacherId === 'teacher_a' ? t.teacherA : t.teacherB}
            </div>
          </div>

          <div className="flex items-center gap-1.5 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-3">
            <button
              onClick={() => onSelectTeacher('teacher_a')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTeacherId === 'teacher_a'
                  ? 'bg-[#C4A46A] text-[#173A55] shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              切为张老师
            </button>
            <button
              onClick={() => onSelectTeacher('teacher_b')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTeacherId === 'teacher_b'
                  ? 'bg-[#C4A46A] text-[#173A55] shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              切为李老师
            </button>
          </div>
        </div>
      </div>

      {/* Mutex Demonstration Alert */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#173A55]">
            教师任务独占认领机制 (Mutex Lock Simulation):
          </p>
          <p className="text-slate-700 leading-relaxed">
            为防止不同评测教师对同一学生的评分发生冲突覆盖，当一位老师认领任务后，其他老师账号被禁止保存草稿或发布（仅能只读查看）。您可以通过右上角切换张老师/李老师验证互斥与权限隔离。
          </p>
        </div>
      </div>

      {/* Task Queue Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#173A55] flex items-center gap-2">
            <span>{t.taskTableTitle}</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              共 {records.length} 个任务
            </span>
          </h2>
          <span className="text-xs text-slate-400">
            四科短测已提交 · 待教师审核
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-3.5">{t.colStudent}</th>
                <th className="px-6 py-3.5">{t.colTarget}</th>
                <th className="px-6 py-3.5">{t.colSubmittedAt}</th>
                <th className="px-6 py-3.5">{t.colStatus}</th>
                <th className="px-6 py-3.5">{t.colHandler}</th>
                <th className="px-6 py-3.5 text-right">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {records.map((rec) => {
                const isClaimedByMe = rec.claimedBy === activeTeacherId;
                const isClaimedByOther = rec.claimedBy !== null && rec.claimedBy !== activeTeacherId;
                const isUnclaimed = rec.claimedBy === null;
                const isPublished = rec.taskStatus === 'published';

                return (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                    {/* Student Info */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#173A55] text-sm">
                        {rec.student.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {rec.student.enName} · {rec.student.phone}
                      </div>
                    </td>

                    {/* Target */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-amber-700">
                        目标: Band {rec.student.targetOverall}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {rec.student.currentLevel}
                      </div>
                    </td>

                    {/* Submitted At */}
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rec.student.submittedAt}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          已正式发布
                        </span>
                      ) : rec.taskStatus === 'draft_saved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800">
                          <Edit3 className="w-3 h-3 text-sky-600" />
                          草稿保存中
                        </span>
                      ) : rec.claimedBy ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900">
                          <Clock className="w-3 h-3 text-amber-600" />
                          复核处理中
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                          待教师认领
                        </span>
                      )}
                    </td>

                    {/* Handler / Claim State */}
                    <td className="px-6 py-4">
                      {isClaimedByMe ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <UserCheck className="w-3.5 h-3.5" />
                          我已锁定办理
                        </span>
                      ) : isClaimedByOther ? (
                        <span className="inline-flex items-center gap-1.5 text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                          <Lock className="w-3.5 h-3.5" />
                          {rec.claimedByName ? rec.claimedByName.split(' ')[0] : '其他教师'} 锁定
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          <Unlock className="w-3.5 h-3.5" />
                          空闲待领
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isUnclaimed ? (
                          <button
                            onClick={() => onClaimTask(rec.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#C4A46A] hover:bg-[#b09057] text-[#173A55] font-bold text-xs shadow-xs transition flex items-center gap-1"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            <span>{t.claimTask}</span>
                          </button>
                        ) : isClaimedByMe ? (
                          <button
                            onClick={() => onOpenAudit(rec.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#173A55] hover:bg-[#204C6E] text-white font-bold text-xs shadow-xs transition flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                            <span>{t.openAudit}</span>
                          </button>
                        ) : (
                          // Claimed by someone else -> Read-only view
                          <button
                            onClick={() => onOpenAudit(rec.id)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium text-xs transition flex items-center gap-1"
                            title="被其他教师锁定中，仅可只读查看"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>只读查看</span>
                          </button>
                        )}

                        {isPublished && (
                          <button
                            onClick={() => onOpenPublishedReport(rec.id)}
                            className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50"
                            title="查看已发布报告"
                          >
                            <Award className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
