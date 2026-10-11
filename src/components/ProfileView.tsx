import React, { useState } from 'react';
import { AssessmentRecord, Language, StudentProfile } from '../types/assessment';
import { translations } from '../utils/i18n';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Target, 
  Clock, 
  Mail, 
  Phone, 
  CheckCircle,
  Save
} from 'lucide-react';

interface ProfileViewProps {
  record: AssessmentRecord;
  lang: Language;
  onBack: () => void;
  onSaveProfile: (profile: StudentProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  record,
  lang,
  onBack,
  onSaveProfile,
}) => {
  const t = translations[lang];
  const [profile, setProfile] = useState<StudentProfile>(record.student);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profile);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onBack();
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#173A55] font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToHub}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-serif font-bold text-[#173A55] flex items-center gap-2">
            <User className="w-6 h-6 text-[#C4A46A]" />
            <span>学员入学诊断基本信息</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            本档案用于赛思教研团队生成个性化雅思备考与分班建议
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                中文姓名
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#173A55] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                English Name
              </label>
              <input
                type="text"
                value={profile.enName}
                onChange={(e) => setProfile({ ...profile, enName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#173A55] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                联系手机
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#173A55] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                电子邮箱
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#173A55] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h2 className="text-sm font-bold text-[#173A55] flex items-center gap-2">
              <Target className="w-4 h-4 text-[#C4A46A]" />
              <span>目标雅思分数与备考周期</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                  目标总分
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="4.0"
                  max="9.0"
                  value={profile.targetOverall}
                  onChange={(e) => setProfile({ ...profile, targetOverall: parseFloat(e.target.value) || 6.5 })}
                  className="w-full px-2.5 py-1.5 text-xs font-bold text-[#173A55] border border-slate-300 rounded-lg text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                  目标听力
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="4.0"
                  max="9.0"
                  value={profile.targetListening}
                  onChange={(e) => setProfile({ ...profile, targetListening: parseFloat(e.target.value) || 6.5 })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                  目标阅读
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="4.0"
                  max="9.0"
                  value={profile.targetReading}
                  onChange={(e) => setProfile({ ...profile, targetReading: parseFloat(e.target.value) || 6.5 })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                  目标写作
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="4.0"
                  max="9.0"
                  value={profile.targetWriting}
                  onChange={(e) => setProfile({ ...profile, targetWriting: parseFloat(e.target.value) || 6.5 })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                  目标口语
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="4.0"
                  max="9.0"
                  value={profile.targetSpeaking}
                  onChange={(e) => setProfile({ ...profile, targetSpeaking: parseFloat(e.target.value) || 6.5 })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  预计报考月份
                </label>
                <input
                  type="month"
                  value={profile.examMonth}
                  onChange={(e) => setProfile({ ...profile, examMonth: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  当前英语基础背景
                </label>
                <input
                  type="text"
                  value={profile.currentLevel}
                  onChange={(e) => setProfile({ ...profile, currentLevel: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  placeholder="如: 大学英语六级520分 / 预估雅思5.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                每周预期投入备考时间 (小时)
              </label>
              <input
                type="number"
                min="2"
                max="60"
                value={profile.weeklyHours}
                onChange={(e) => setProfile({ ...profile, weeklyHours: parseInt(e.target.value) || 10 })}
                className="w-40 px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold text-[#173A55]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {savedNotice ? (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                个人档案已更新保存
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#173A55] hover:bg-[#204C6E] text-white font-bold text-xs shadow-sm transition flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-[#C4A46A]" />
              <span>保存档案并返回测评</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
