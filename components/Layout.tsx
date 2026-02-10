
import React from 'react';
import { 
  LayoutDashboard, 
  ListTodo, 
  Map as MapIcon, 
  Settings, 
  Bell, 
  Search,
  LogOut,
  History as HistoryIcon,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Star,
  MessageCircleQuestion,
  Wrench
} from 'lucide-react';
import { IntegrationStatus } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  integrations: IntegrationStatus[];
  notificationsCount: number;
  isDarkMode: boolean;
  onIntegrationClick: (name: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  integrations,
  notificationsCount,
  isDarkMode,
  onIntegrationClick
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  // Auto-close sidebar on mobile when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: "Today's Workload", icon: ListTodo },
    { id: 'map', label: 'Live Map', icon: MapIcon },
    { id: 'history', label: 'Task History', icon: HistoryIcon },
    { id: 'maintenance-history', label: 'Maintenance History', icon: Wrench },
    { id: 'ai-helper', label: 'AI Helper', icon: MessageCircleQuestion, hasStar: true },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: notificationsCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const logoUrl = "https://www.michaelcoen.com/images/TeleTrackingWhiteLogo.png";

  return (
    <div className={`h-screen flex overflow-hidden ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col
        ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full md:w-20 md:translate-x-0'}
        md:sticky md:top-0 md:h-screen overflow-hidden
      `}>
        
        {/* Branding Section */}
        <div className={`flex flex-col items-center justify-center bg-blue-600 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'py-10 px-8' : 'h-16 py-0 px-0'}`}>
          {isSidebarOpen && (
            <>
              <div className="w-full flex justify-center items-center relative">
                <img 
                  src={logoUrl} 
                  alt="TeleTracking" 
                  className="w-full h-auto object-contain transition-all duration-300" 
                />
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="md:hidden absolute -right-2 top-0 p-2 text-white/70 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mt-2 text-center">
                <span className="font-black text-lg tracking-[0.25em] text-white uppercase block whitespace-nowrap overflow-hidden">
                  Service IQ
                </span>
              </div>
            </>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            // maintenance-history and device-details are linked to the same menu item for active state
            const isActive = activeTab === item.id || (item.id === 'maintenance-history' && activeTab === 'device-details');
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-4 px-3 py-4 rounded-2xl transition-all relative ${
                  isActive 
                    ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-500/20' 
                    : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 font-bold'
                }`}
              >
                <item.icon size={22} className={isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'} />
                {(isSidebarOpen || window.innerWidth < 768) && (
                  <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis uppercase text-[11px] font-black tracking-wider">{item.label}</span>
                )}
                {(isSidebarOpen || window.innerWidth < 768) && item.hasStar && (
                  <Star size={16} className={`${isActive ? 'text-blue-200 fill-blue-200' : 'text-amber-500 fill-amber-500'} animate-pulse ml-auto`} />
                )}
                {(isSidebarOpen || window.innerWidth < 768) && item.badge && item.badge > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white text-blue-600' : 'bg-red-600 text-white'} ml-auto`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button className="w-full flex items-center gap-4 px-3 py-3 text-slate-700 dark:text-slate-400 hover:text-red-600 transition-colors font-bold">
            <LogOut size={22} />
            {(isSidebarOpen || window.innerWidth < 768) && <span className="whitespace-nowrap overflow-hidden text-ellipsis font-bold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Fixed Header */}
        <header className="h-16 shrink-0 bg-blue-600 border-b border-blue-700 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
            >
              {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
            <div className="hidden sm:flex items-center bg-white/10 px-3 py-1.5 rounded-full border border-white/20 w-64">
              <Search size={16} className="text-white/70" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm ml-2 w-full text-white placeholder:text-white/60 font-bold"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden lg:flex items-center gap-4 mr-4">
              {integrations.map(int => (
                <button 
                  key={int.name} 
                  onClick={() => onIntegrationClick(int.name)}
                  className="flex items-center gap-2 group relative hover:bg-white/10 px-2 py-1 rounded-lg transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${int.status === 'active' ? 'bg-green-400' : 'bg-amber-400'}`}></div>
                  <span className="text-xs font-black text-white uppercase tracking-tight">{int.name}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => handleTabChange('notifications')}
              className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Bell size={20} />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-blue-600 shadow-sm">
                  {notificationsCount}
                </span>
              )}
            </button>
            
            <div className="flex items-center gap-2 md:gap-4 pl-2 md:pl-4 border-l border-white/20">
              <div className="text-right hidden xs:block">
                <p className="text-sm font-black text-white leading-tight">Alex Riveria</p>
                <p className="text-[10px] text-white/70 font-black uppercase tracking-tighter">Command Lead</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 font-black text-xs">
                AR
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-4 md:pb-8 custom-scrollbar bg-slate-50 dark:bg-slate-950">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        @media (max-width: 400px) {
          .xs\\:block { display: none; }
        }
      `}} />
    </div>
  );
};
