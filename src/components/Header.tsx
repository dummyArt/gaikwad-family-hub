import React, { useState } from 'react';
import {
  Home,
  Image as ImageIcon,
  Video,
  Music,
  FolderHeart,
  Users,
  PhoneCall,
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  LogOut,
  ChevronDown,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, openAuthModal }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout, isSuperAdmin, isAdmin } = useAuth();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'photos', label: t.navPhotos, icon: ImageIcon },
    { id: 'videos', label: t.navVideos, icon: Video },
    { id: 'music', label: t.navMusic, icon: Music },
    { id: 'albums', label: t.navAlbums, icon: FolderHeart },
    { id: 'members', label: t.navMembers, icon: Users },
    { id: 'contacts', label: t.navContacts, icon: PhoneCall },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: t.navAdmin, icon: ShieldCheck });
  }

  return (
    <header className="sticky top-0 z-50 bg-[#FDFBF7]/95 dark:bg-[#1a1210]/95 backdrop-blur-md border-b border-amber-200/60 dark:border-amber-900/40 shadow-xs transition-colors duration-200">
      {/* Top sacred motif bar */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-red-600 to-amber-500 w-full" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Home Button + Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
                activeTab === 'home'
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 shadow-inner'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800'
              }`}
              title={t.navHome}
              aria-label={t.navHome}
            >
              <Home className="w-6 h-6 text-amber-800 dark:text-amber-400" />
            </button>

            {/* Logo & Royal Crest */}
            <div
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none group"
            >
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-red-800 via-amber-600 to-yellow-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
                <div className="w-full h-full rounded-full bg-[#FAF6EE] dark:bg-[#201513] flex items-center justify-center overflow-hidden">
                  <div className="text-amber-800 dark:text-amber-400 font-bold text-xs sm:text-sm tracking-wider font-serif">
                    GF
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 text-[10px] sm:text-[11px]">👑</div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-heading font-extrabold text-base sm:text-xl lg:text-2xl tracking-wide text-stone-900 dark:text-amber-50 group-hover:text-red-800 dark:group-hover:text-amber-400 transition-colors">
                    GAIKWAD FAMILY
                  </span>
                  <span className="text-red-600 text-xs sm:text-sm animate-pulse">❤️</span>
                </div>
                <span className="hidden sm:inline text-[11px] sm:text-xs font-medium text-amber-800/90 dark:text-amber-300/80 tracking-wide font-sans truncate max-w-[200px] lg:max-w-none">
                  {language === 'hi' ? 'हमारा परिवार • हमारी यादें • हमारी खुशी ❤️' : 'Our Family • Our Memories • Our Happiness ❤️'}
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation - Desktop */}
          <nav className="hidden xl:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                    isActive
                      ? 'text-red-900 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 shadow-xs'
                      : 'text-stone-700 dark:text-stone-300 hover:text-red-800 dark:hover:text-amber-200 hover:bg-amber-50/70 dark:hover:bg-stone-800/60'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mb-1 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-red-700 dark:text-amber-400' : 'text-stone-600 dark:text-stone-400'
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 w-6 h-0.5 bg-red-700 dark:bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Language Switcher, Theme Toggle, User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full bg-amber-100/90 dark:bg-stone-800 text-amber-950 dark:text-amber-200 hover:bg-amber-200/90 dark:hover:bg-stone-700 border border-amber-300/60 dark:border-stone-700 transition-all shadow-xs"
                aria-label="Language Selector"
              >
                <Globe className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>{language === 'hi' ? 'हिंदी' : 'English'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-amber-200 dark:border-stone-800 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      setLanguage('hi');
                      setLangMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    <span className="font-medium">हिन्दी</span>
                    {language === 'hi' && <Check className="w-4 h-4 text-amber-700 dark:text-amber-400" />}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setLangMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    <span className="font-medium">English</span>
                    {language === 'en' && <Check className="w-4 h-4 text-amber-700 dark:text-amber-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-stone-700 dark:text-stone-300 hover:bg-amber-100/80 dark:hover:bg-stone-800 transition-colors"
              title={theme === 'dark' ? t.lightMode : t.darkMode}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-stone-700" />
              )}
            </button>

            {/* User Profile / Login */}
            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-amber-50 dark:bg-stone-800 border border-amber-300/70 dark:border-stone-700 hover:border-amber-500 transition-all shadow-xs"
                  aria-label="User Menu"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-amber-200 ring-2 ring-amber-400/50 flex items-center justify-center">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-amber-800" />
                    )}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate max-w-[100px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider">
                      {isSuperAdmin ? 'Super Admin' : currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </button>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-700 text-white font-medium text-xs sm:text-sm hover:bg-red-800 shadow-sm transition-all"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>{t.navLogin}</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {userMenuOpen && currentUser && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-amber-200 dark:border-stone-800 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-stone-800 dark:to-stone-800/80 rounded-xl mb-2">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-300 ring-2 ring-amber-500">
                        {currentUser.avatar ? (
                          <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-6 h-6 m-2 text-amber-900" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-sm text-stone-900 dark:text-white truncate">
                          {currentUser.name}
                        </div>
                        <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
                          {currentUser.email}
                        </div>
                      </div>
                    </div>

                    {isSuperAdmin && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-950/80 px-2.5 py-1 rounded-full w-fit">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>Website Creator & Super Admin</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('members');
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 rounded-lg transition-colors"
                  >
                    <Users className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <span>{t.navProfile}</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 rounded-lg transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span>{t.navAdmin}</span>
                    </button>
                  )}

                  <hr className="my-1.5 border-stone-200 dark:border-stone-800" />

                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.navLogout}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#FDFBF7] dark:bg-[#1a1210] border-b border-amber-200 dark:border-stone-800 px-4 pt-2 pb-5 space-y-1 shadow-lg animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-amber-100 dark:bg-amber-950 text-red-900 dark:text-amber-200'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800'
                }`}
              >
                <Icon className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
