import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  Cake,
  Edit2,
  Lock,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';

export const FamilyDirectory: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentUser, isApproved, isAdmin, updateUser } = useAuth();

  const [members, setMembers] = useState<User[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<{ user: User; daysLeft: number }[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit profile modal state
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const loadDirectory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('gaikwad_auth_token');
      const [membersRes, bdayRes] = await Promise.all([
        fetch('/api/members', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }),
        fetch('/api/birthdays/upcoming')
      ]);

      const membersData = await membersRes.json();
      const bdayData = await bdayRes.json();

      setMembers(membersData.members || []);
      setUpcomingBirthdays(bdayData.upcoming || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory();
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setSaveLoading(true);

    try {
      const token = localStorage.getItem('gaikwad_auth_token');
      const res = await fetch(`/api/members/${editingMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingMember)
      });
      const data = await res.json();
      if (res.ok) {
        setMembers(prev => prev.map(m => (m.id === data.member.id ? data.member : m)));
        if (currentUser && currentUser.id === data.member.id) {
          updateUser(data.member);
        }
        setEditingMember(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const filteredMembers = members.filter(m => {
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.relationship && m.relationship.toLowerCase().includes(q)) ||
      (m.relationshipHindi && m.relationshipHindi.toLowerCase().includes(q)) ||
      (m.address && m.address.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-600/10 via-red-500/10 to-amber-600/10 dark:from-amber-950/20 dark:to-red-950/20 border border-amber-300/60 dark:border-amber-800/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-stone-900 dark:text-amber-100">
              {t.directoryTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1">
            {t.directorySubtitle}
          </p>
        </div>

        {/* Member Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'hi' ? 'सदस्य या रिश्ता खोजें...' : 'Search member or relation...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Upcoming Birthdays Showcase Bar */}
      {upcomingBirthdays.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 dark:from-stone-900 dark:via-stone-850 dark:to-stone-900 border-2 border-amber-300/70 dark:border-amber-800/50 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Cake className="w-5 h-5 text-red-600 animate-bounce" />
            <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-amber-200">
              {t.upcomingBirthdays}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {upcomingBirthdays.map(({ user: bdayUser, daysLeft }) => (
              <div
                key={bdayUser.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-stone-800 border border-amber-200 dark:border-stone-700 shadow-xs"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-amber-200 shrink-0 ring-2 ring-amber-400">
                  <img src={bdayUser.avatar} alt={bdayUser.name} className="w-full h-full object-cover" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white truncate">
                    {bdayUser.name}
                  </h4>
                  <p className="text-[11px] text-amber-800 dark:text-amber-400 font-medium">
                    {language === 'hi' ? bdayUser.relationshipHindi : bdayUser.relationship}
                  </p>
                  <p className="text-[11px] font-bold text-red-600 dark:text-red-400">
                    {daysLeft === 0
                      ? (language === 'hi' ? '🎉 आज जन्मदिन है!' : '🎉 Today is the birthday!')
                      : `${daysLeft} ${t.daysLeft}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Notice if Not Logged In */}
      {!isApproved && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
          <Lock className="w-5 h-5 text-amber-700 shrink-0" />
          <p>
            {language === 'hi'
              ? 'सुरक्षा व गोपनीयता: परिवार के सदस्यों के व्यक्तिगत फ़ोन नंबर और पते केवल स्वीकृत पारिवारिक सदस्यों के लिए सुरक्षित हैं।'
              : 'Privacy Protected: Direct phone numbers and home addresses are exclusively visible to approved family members.'}
          </p>
        </div>
      )}

      {/* Members Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-stone-500">{t.loading}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const isCreator = member.role === 'super_admin';
            const canEdit = currentUser && (currentUser.id === member.id || isAdmin);

            return (
              <div
                key={member.id}
                className={`group relative rounded-3xl p-5 bg-white dark:bg-stone-900 border transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between ${
                  isCreator
                    ? 'border-2 border-amber-400 dark:border-amber-500/80 bg-gradient-to-b from-[#FFFDF6] to-white dark:from-[#211612] dark:to-stone-900'
                    : 'border-amber-200/80 dark:border-stone-800'
                }`}
              >
                <div>
                  
                  {/* Top Badge: Creator or Elder */}
                  {isCreator && (
                    <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-[10px] uppercase tracking-wider shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      <span>{t.creatorBadge}</span>
                    </div>
                  )}

                  {/* Profile Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-amber-100 dark:bg-stone-800 shrink-0 ring-2 ring-amber-400/80 shadow-md">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <Users className="w-8 h-8 m-4 text-amber-800" />
                      )}
                    </div>

                    <div className="overflow-hidden">
                      <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100 truncate">
                        {member.name}
                      </h3>
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                        {language === 'hi' ? (member.relationshipHindi || member.relationship) : member.relationship}
                      </p>
                      {member.birthday && (
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-red-600" />
                          <span>{member.birthday}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {member.bio && (
                    <p className="text-xs text-stone-600 dark:text-stone-300 italic mb-4 leading-relaxed bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded-xl border border-stone-100 dark:border-stone-700/50">
                      "{member.bio}"
                    </p>
                  )}

                  {/* Contact Info (Protected) */}
                  <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                      <span className="font-medium truncate">{member.phone || 'Not shared'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>

                    {member.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{member.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons: Call / WhatsApp / Edit */}
                <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {member.phone && isApproved && !member.phone.includes('Protected') && (
                      <>
                        <a
                          href={`tel:${member.phone.replace(/[^0-9+]/g, '')}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{t.callNow}</span>
                        </a>

                        <a
                          href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-500 transition-colors shadow-xs"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </>
                    )}
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => setEditingMember(member)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Edit Profile Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-amber-300 dark:border-stone-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-bold text-lg text-stone-900 dark:text-white">
                Edit Member Profile
              </h3>
              <button onClick={() => setEditingMember(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Relationship (English / Hindi)
                </label>
                <input
                  type="text"
                  value={editingMember.relationship || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, relationship: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Birthday (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={editingMember.birthday || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, birthday: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editingMember.phone || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={editingMember.address || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, address: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Short Bio or Memories
                </label>
                <textarea
                  rows={2}
                  value={editingMember.bio || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md"
                >
                  {saveLoading ? t.loading : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
