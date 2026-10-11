import React from 'react';
import { Language, Role, TeacherId } from '../types/assessment';
import { translations } from '../utils/i18n';
import { 
  Award, 
  FileText, 
  User, 
  Globe, 
  RotateCcw, 
  BookOpen, 
  ShieldCheck, 
  GraduationCap, 
  Lock,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  role: Role;
  onSelectRole: (role: Role) => void;
  activeTeacherId: TeacherId;
  onSelectTeacher: (id: TeacherId) => void;
  currentView: string;
  onNavigate: (view: string) => void;
  onResetData: () => void;
  hasPublishedReport: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  role,
  onSelectRole,
  activeTeacherId,
  onSelectTeacher,
  currentView,
  onNavigate,
  onResetData,
  hasPublishedReport,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-50 bg-[#173A55] text-white shadow-md border-b border-[#C4A46A]/30">
      {/* Global Compliance Banner */}
      <div className="bg-[#0F273B] text-amber-200/90 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-amber-500/20">
        <ShieldCheck className="w-3.5 h-3.5 text-[#C4A46A]" />
        <span>{t.complianceBanner}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div 
            onClick={() => onNavigate('hub')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg text-[#F5F4F0] tracking-wider">
                  {t.brandName}
                </span>
              </div>
              <div className="text-[11px] text-slate-300/80 font-sans tracking-widest uppercase">
                {t.brandSub} · SAGE ASSESSMENT
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Student Hub Button */}
            <button
              onClick={() => {
                onSelectRole('student');
                onNavigate('hub');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                role === 'student' && currentView !== 'report'
                  ? 'bg-white/15 text-[#F5F4F0] shadow-inner font-semibold border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#C4A46A]" />
              <span>{t.navStudent}</span>
            </button>

            {/* Teacher Workbench Button */}
            <button
              onClick={() => {
                onSelectRole('teacher');
                onNavigate('teacher-workbench');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                role === 'teacher' && currentView !== 'report'
                  ? 'bg-white/15 text-[#F5F4F0] shadow-inner font-semibold border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-[#C4A46A]" />
              <span>{t.navTeacher}</span>
            </button>

            {/* Dedicated Report Menu Item */}
            <button
              onClick={() => onNavigate('report')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                currentView === 'report'
                  ? 'bg-[#C4A46A] text-[#173A55] font-bold shadow-md'
                  : 'text-amber-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{t.navReport}</span>
              {hasPublishedReport && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          </nav>

          {/* Right Controls: Role & Teacher Picker, Language, Reset */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Teacher Identity Dropdown (visible in teacher mode) */}
            {role === 'teacher' && (
              <div className="relative group">
                <div className="flex items-center gap-1.5 bg-[#0F273B] text-amber-200 px-3 py-1.5 rounded-lg border border-amber-500/30 text-xs">
                  <User className="w-3.5 h-3.5 text-[#C4A46A]" />
                  <span className="hidden sm:inline font-medium">
                    {activeTeacherId === 'teacher_a' ? t.teacherA : t.teacherB}
                  </span>
                  <span className="sm:hidden font-medium">
                    {activeTeacherId === 'teacher_a' ? '张老师' : '李老师'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                {/* Dropdown Options */}
                <div className="absolute right-0 mt-1 w-52 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1 hidden group-hover:block z-50">
                  <div className="px-3 py-1.5 text-[11px] text-slate-400 font-semibold uppercase border-b border-slate-100">
                    {t.switchTeacher}
                  </div>
                  <button
                    onClick={() => onSelectTeacher('teacher_a')}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      activeTeacherId === 'teacher_a' ? 'font-bold text-[#173A55] bg-amber-50/60' : ''
                    }`}
                  >
                    <span>{t.teacherA}</span>
                    {activeTeacherId === 'teacher_a' && <span className="text-[#C4A46A]">✓</span>}
                  </button>
                  <button
                    onClick={() => onSelectTeacher('teacher_b')}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      activeTeacherId === 'teacher_b' ? 'font-bold text-[#173A55] bg-amber-50/60' : ''
                    }`}
                  >
                    <span>{t.teacherB}</span>
                    {activeTeacherId === 'teacher_b' && <span className="text-[#C4A46A]">✓</span>}
                  </button>
                </div>
              </div>
            )}

            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors border border-white/10"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#C4A46A]" />
              <span>{t.langToggle}</span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => {
                if (window.confirm(t.resetConfirm)) {
                  onResetData();
                }
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-rose-400/20"
              title={t.resetDemo}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t.resetDemo}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around bg-[#0F273B] px-2 py-2 border-t border-white/10 text-xs">
        <button
          onClick={() => {
            onSelectRole('student');
            onNavigate('hub');
          }}
          className={`flex items-center gap-1 py-1 px-3 rounded ${
            role === 'student' && currentView !== 'report' ? 'bg-[#C4A46A] text-[#173A55] font-bold' : 'text-slate-300'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t.roleStudent}</span>
        </button>
        <button
          onClick={() => {
            onSelectRole('teacher');
            onNavigate('teacher-workbench');
          }}
          className={`flex items-center gap-1 py-1 px-3 rounded ${
            role === 'teacher' && currentView !== 'report' ? 'bg-[#C4A46A] text-[#173A55] font-bold' : 'text-slate-300'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>{t.roleTeacher}</span>
        </button>
        <button
          onClick={() => onNavigate('report')}
          className={`flex items-center gap-1 py-1 px-3 rounded ${
            currentView === 'report' ? 'bg-[#C4A46A] text-[#173A55] font-bold' : 'text-amber-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>{t.navReport}</span>
        </button>
      </div>
    </header>
  );
};
