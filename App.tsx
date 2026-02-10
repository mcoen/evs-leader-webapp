
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { TaskList } from './components/TaskList.tsx';
import { FloorPlan } from './components/FloorPlan.tsx';
import { History } from './components/History.tsx';
import { ChatWindow } from './components/ChatWindow.tsx';
import { IntegrationDetails } from './components/IntegrationDetails.tsx';
import { TaskDetails } from './components/TaskDetails.tsx';
import { NotificationDetails } from './components/NotificationDetails.tsx';
import { AIHelper } from './components/AIHelper.tsx';
import { KPIDrilldown } from './components/KPIDrilldown.tsx';
import { RoomDetails } from './components/RoomDetails.tsx';
import { TaskModal } from './components/TaskModal.tsx';
import { MaintenanceHistory } from './components/MaintenanceHistory.tsx';
import { DeviceDetails } from './components/DeviceDetails.tsx';
import { KPI_OUTCOMES, MOCK_TASKS, MOCK_INTEGRATIONS, MOCK_NOTIFICATIONS, FACILITIES, DEPARTMENTS, JCI_INTEGRATION_DETAIL, SERVICENOW_INTEGRATION_DETAIL, MOCK_ASSETS, getMockRoomDetail, MOCK_MAINTENANCE_DEVICES } from './constants.tsx';
import { EVSTask, TaskStatus, Notification, DateFilter, KPIData, RoomDetail, MaintenanceDevice } from './types.ts';
import { 
  ArrowLeft, 
  Bell, 
  Shield, 
  Eye, 
  RefreshCcw, 
  Timer, 
  Globe, 
  Check, 
  Moon, 
  Sun, 
  SlidersHorizontal,
  BellRing,
  Smartphone,
  ShieldCheck,
  BrainCircuit,
  Database,
  UserCircle,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState<EVSTask[]>(MOCK_TASKS);
  const [notifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState('All Facilities');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [filter, setFilter] = useState<DateFilter>('24h');
  const [chatRecipient, setChatRecipient] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  // Settings States
  const [refreshInterval, setRefreshInterval] = useState('30s');
  const [escalationThreshold, setEscalationThreshold] = useState(45);
  const [showWorkerNames, setShowWorkerNames] = useState(true);
  const [alertSeverity, setAlertSeverity] = useState('All');
  const [defaultFacility, setDefaultFacility] = useState('HCA Florida Mercy Hospital');
  const [aiGroundingLevel, setAiGroundingLevel] = useState('Standard');

  // Profile States
  const [userName, setUserName] = useState('Alex Riveria');
  const [userRole, setUserRole] = useState('Command Lead');
  const [userEmail, setUserEmail] = useState('a.riveria@hca.health');
  const [userPhone, setUserPhone] = useState('+1 (555) 234-5678');

  // Drill-down States
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomDetail | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<MaintenanceDevice | null>(null);
  const [previousTab, setPreviousTab] = useState<string>('tasks');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const facilityMatch = selectedFacility === 'All Facilities' || t.facility === selectedFacility;
      const deptMatch = selectedDepartment === 'All Departments' || t.category === selectedDepartment;
      return facilityMatch && deptMatch;
    });
  }, [tasks, selectedFacility, selectedDepartment]);

  const dynamicOutcomes = useMemo(() => {
    const timeOptions: DateFilter[] = ['12h', '24h', '7d', '30d', 'quarter', 'year'];
    return KPI_OUTCOMES.map(m => {
      const fIdx = FACILITIES.indexOf(selectedFacility);
      const dIdx = DEPARTMENTS.indexOf(selectedDepartment);
      const tIdx = timeOptions.indexOf(filter);
      const seed = (fIdx + 1) * 7 + (dIdx + 1) * 3 + (tIdx + 1) * 11;
      let val = Number(m.value.toString().replace(/,/g, ''));
      
      if (m.id === 'k_lb') {
        val = 84;
      } else if (m.unit === '$') {
        const timeMultiplier = 1 + (tIdx * 0.8);
        const facilityScale = fIdx === 0 ? 1 : 0.2 + ((fIdx % 3) * 0.1); 
        val = val * timeMultiplier * facilityScale;
      } else if (m.unit === '%') {
        const shift = (seed % 14) - 7;
        val = Math.min(100, Math.max(0, val + shift));
      } else if (m.unit === 'min') {
        const shift = (seed % 20) - 10;
        val = Math.max(1, val + shift);
      } else if (m.unit?.includes('/1000h')) {
        const shift = ((seed % 10) - 5) / 100;
        val = Math.max(0, val + shift);
      }
      const trendShift = (seed % 6) - 3;
      const newTrend = m.trend + trendShift;
      return {
        ...m,
        value: val.toLocaleString(undefined, { 
          maximumFractionDigits: (m.unit === '$' ? 0 : 2),
          minimumFractionDigits: (m.unit === '$' ? 0 : 1)
        }),
        trend: Number(newTrend.toFixed(1))
      };
    });
  }, [selectedFacility, selectedDepartment, filter]);

  const lbValue = useMemo(() => {
    const lbKpi = dynamicOutcomes.find(o => o.id === 'k_lb');
    return lbKpi ? Number(lbKpi.value.toString().replace(/,/g, '')) : 84;
  }, [dynamicOutcomes]);

  const saveNewTask = (taskData: Omit<EVSTask, 'id' | 'createdAt' | 'status' | 'location'>) => {
    const newTask: EVSTask = {
      ...taskData,
      id: `T${Date.now()}`,
      status: 'Not Started',
      createdAt: new Date().toISOString(),
      location: { x: 10 + Math.random() * 80, y: 10 + Math.random() * 80 }
    };
    setTasks([newTask, ...tasks]);
  };

  const deleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));
  
  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const now = new Date().toISOString();
        return {
          ...t,
          status,
          startTime: status === 'In Progress' && !t.startTime ? now : t.startTime,
          endTime: status === 'Complete' ? now : t.endTime
        };
      }
      return t;
    }));
  };

  const handleIntegrationClick = (name: string) => {
    if (name === 'Johnson Controls') setActiveTab('integration-jci');
    else if (name === 'ServiceNow') setActiveTab('integration-snow');
  };

  const handleViewTaskDetails = (taskId: string, sourceTab: string) => {
    setSelectedTaskId(taskId);
    setPreviousTab(sourceTab);
    setActiveTab('task-details');
  };

  const handleViewRoomDetails = (roomNumber: string, facility: string) => {
    const detail = getMockRoomDetail(roomNumber, facility);
    setSelectedRoom(detail);
    setActiveTab('room-details');
  };

  const handleViewNotificationDetails = (notificationId: string) => {
    setSelectedNotificationId(notificationId);
    setActiveTab('notifications');
  };

  const handleKpiClick = (kpiId: string) => {
    setSelectedKpiId(kpiId);
    setActiveTab('kpi-drilldown');
  };

  const handleViewDeviceDetails = (device: MaintenanceDevice) => {
    setSelectedDevice(device);
    setActiveTab('device-details');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          outcomes={dynamicOutcomes} 
          tasks={filteredTasks} 
          selectedFacility={selectedFacility} 
          setSelectedFacility={setSelectedFacility} 
          selectedDepartment={selectedDepartment} 
          setSelectedDepartment={setSelectedDepartment} 
          filter={filter} 
          setFilter={setFilter}
          onKpiClick={handleKpiClick}
        />;
      case 'kpi-drilldown':
        const kpi = dynamicOutcomes.find(o => o.id === selectedKpiId);
        return kpi ? <KPIDrilldown 
          kpi={kpi} 
          tasks={tasks} 
          onBack={() => setActiveTab('dashboard')} 
          onViewTask={(id) => handleViewTaskDetails(id, 'kpi-drilldown')}
        /> : null;
      case 'tasks':
        return <TaskList tasks={tasks} onAddTask={() => setIsTaskModalOpen(true)} onDeleteTask={deleteTask} onStatusChange={updateTaskStatus} selectedFacility={selectedFacility} setSelectedFacility={setSelectedFacility} onMessageEmployee={(name) => setChatRecipient(name)} onViewTaskDetails={(id) => handleViewTaskDetails(id, 'tasks')} onViewRoomDetails={handleViewRoomDetails} />;
      case 'room-details':
        return selectedRoom ? <RoomDetails room={selectedRoom} onBack={() => setActiveTab('tasks')} onViewTask={(id) => handleViewTaskDetails(id, 'room-details')} /> : null;
      case 'history':
        return <History tasks={tasks} selectedFacility={selectedFacility} setSelectedFacility={setSelectedFacility} onViewTaskDetails={(id) => handleViewTaskDetails(id, 'history')} />;
      case 'maintenance-history':
        return <MaintenanceHistory devices={MOCK_MAINTENANCE_DEVICES} onViewDevice={handleViewDeviceDetails} selectedFacility={selectedFacility} setSelectedFacility={setSelectedFacility} />;
      case 'device-details':
        return selectedDevice ? <DeviceDetails device={selectedDevice} onBack={() => setActiveTab('maintenance-history')} /> : null;
      case 'ai-helper':
        return <AIHelper tasks={tasks} outcomes={dynamicOutcomes} />;
      case 'task-details':
        return selectedTask ? <TaskDetails task={selectedTask} onBack={() => setActiveTab(previousTab)} onMessageEmployee={(name) => setChatRecipient(name)} onStatusChange={updateTaskStatus} /> : null;
      case 'map':
        return (
          <div className="pt-4 md:pt-8 space-y-6 animate-in fade-in duration-500 pb-20">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Team Locations</h1>
              <p className="text-slate-800 dark:text-gray-400 font-bold mt-1">Tracking operations at {selectedFacility}.</p>
            </div>
            <FloorPlan tasks={filteredTasks} assets={MOCK_ASSETS} loadBalancing={lbValue} onMessageEmployee={(name) => setChatRecipient(name)} />
          </div>
        );
      case 'integration-jci':
        return <IntegrationDetails detail={JCI_INTEGRATION_DETAIL} onBack={() => setActiveTab('dashboard')} />;
      case 'integration-snow':
        return <IntegrationDetails detail={SERVICENOW_INTEGRATION_DETAIL} onBack={() => setActiveTab('dashboard')} />;
      case 'notifications':
        return (
          <div className="pt-4 md:pt-8 w-full space-y-8 pb-20">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Notifications</h1>
              <p className="text-slate-800 dark:text-gray-400 font-bold mt-1">Keeping up with what's important.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map(n => (
                <div key={n.id} className={`px-8 py-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${n.type === 'urgent' ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${n.type === 'urgent' ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'}`}>
                      {n.type}
                    </span>
                    <span className="text-[10px] text-slate-700 dark:text-gray-400 font-bold">{n.timestamp}</span>
                  </div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{n.title}</h3>
                  <p className="text-xs text-slate-800 dark:text-gray-200 font-bold max-w-2xl leading-relaxed line-clamp-1">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="pt-4 md:pt-8 w-full space-y-8 pb-20 animate-in fade-in duration-500">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Settings</h1>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">Configure your Command Center preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile & Account Section */}
              <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 p-8 space-y-8 shadow-xl lg:col-span-2">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2 bg-blue-600 text-white rounded-xl">
                    <UserCircle size={20} />
                  </div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter">Profile & Account</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  <div className="flex flex-col items-center gap-4 border-r border-slate-100 dark:border-slate-800 pr-8">
                    <div className="w-32 h-32 rounded-[40px] bg-blue-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-blue-500/20">
                      {userName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <button className="text-[10px] font-black uppercase text-blue-600 hover:underline">Change Picture</button>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <UserCircle size={12} /> Full Name
                      </label>
                      <input 
                        type="text" 
                        value={userName} 
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border-none font-black text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Briefcase size={12} /> Job Title
                      </label>
                      <input 
                        type="text" 
                        value={userRole} 
                        onChange={(e) => setUserRole(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border-none font-black text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Mail size={12} /> Email Address
                      </label>
                      <input 
                        type="email" 
                        value={userEmail} 
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border-none font-black text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Phone size={12} /> Contact Number
                      </label>
                      <input 
                        type="text" 
                        value={userPhone} 
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border-none font-black text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* UI & Display Section */}
              <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 p-8 space-y-8 shadow-xl">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                    <SlidersHorizontal size={20} />
                  </div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter">UI & Interface</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between group">
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors flex items-center gap-2">
                        <Moon size={16} className="text-slate-400" /> Interface Theme
                      </h4>
                      <p className="text-xs text-slate-500 font-bold">Toggle dark and light interface modes.</p>
                    </div>
                    <button 
                      onClick={() => setIsDarkMode(!isDarkMode)} 
                      className={`w-14 h-7 rounded-full p-1 transition-all flex items-center ${isDarkMode ? 'bg-blue-600' : 'bg-slate-200'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-all shadow-md flex items-center justify-center ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`}>
                        {isDarkMode ? <Moon size={10} className="text-blue-600" /> : <Sun size={10} className="text-amber-500" />}
                      </div>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Globe size={16} className="text-slate-400" /> Default Facility View
                    </h4>
                    <select 
                      value={defaultFacility}
                      onChange={(e) => setDefaultFacility(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border-none font-black text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      {FACILITIES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center justify-between group">
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors flex items-center gap-2">
                        <Eye size={16} className="text-slate-400" /> Map Privacy
                      </h4>
                      <p className="text-xs text-slate-500 font-bold">Show worker names on the live map.</p>
                    </div>
                    <button 
                      onClick={() => setShowWorkerNames(!showWorkerNames)} 
                      className={`w-14 h-7 rounded-full p-1 transition-all flex items-center ${showWorkerNames ? 'bg-blue-600' : 'bg-slate-200'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-all shadow-md ${showWorkerNames ? 'translate-x-7' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Operational Parameters */}
              <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 p-8 space-y-8 shadow-xl">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                    <Timer size={20} />
                  </div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter">Operational Logic</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <RefreshCcw size={16} className="text-slate-400" /> Live Data Sync Rate
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {['15s', '30s', '60s'].map(val => (
                        <button 
                          key={val}
                          onClick={() => setRefreshInterval(val)}
                          className={`py-2 text-[10px] font-black rounded-xl border transition-all ${
                            refreshInterval === val 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {val} Interval
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Shield size={16} className="text-slate-400" /> Escalation Threshold
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold mb-2">Mark tasks as "Overdue" after these many minutes.</p>
                    <input 
                      type="range" 
                      min="15" 
                      max="120" 
                      step="5"
                      value={escalationThreshold}
                      onChange={(e) => setEscalationThreshold(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] font-black text-slate-500">
                      <span>15m</span>
                      <span className="text-blue-600 font-black">{escalationThreshold}m</span>
                      <span>120m</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI & Intelligence */}
              <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 p-8 space-y-8 shadow-xl">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                    <BrainCircuit size={20} />
                  </div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter">AI Intelligence</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">Knowledge Grounding</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {['Standard', 'High (Multi-Facility)', 'Expert (Deep Prediction)'].map(val => (
                        <button 
                          key={val}
                          onClick={() => setAiGroundingLevel(val)}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            aiGroundingLevel === val 
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' 
                            : 'bg-slate-50 dark:bg-slate-800 border-transparent'
                          }`}
                        >
                          <span className={`text-xs font-black ${aiGroundingLevel === val ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                            {val}
                          </span>
                          {aiGroundingLevel === val && <Check size={16} className="text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => localStorage.removeItem('siq_last_queries')}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-slate-800 transition-all active:scale-95"
                  >
                    <Database size={16} /> Clear AI Interaction Cache
                  </button>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 p-8 space-y-8 shadow-xl">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-xl">
                    <BellRing size={20} />
                  </div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter">Alerting</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">Push Alert Severity</h4>
                    <select 
                      value={alertSeverity}
                      onChange={(e) => setAlertSeverity(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border-none font-black text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      <option value="All">All Severity Levels</option>
                      <option value="Warning+">Warning & Urgent Only</option>
                      <option value="Urgent">Urgent Only</option>
                    </select>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                    <Smartphone size={20} className="text-slate-400 mt-1" />
                    <div>
                      <h5 className="text-xs font-black text-slate-800 dark:text-slate-200">Mobile Sync</h5>
                      <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                        Alerting is currently synced with your registered device (AR-Phone-12). 
                        To change primary devices, visit the security portal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center pt-8 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <ShieldCheck size={14} className="text-emerald-500" /> Configuration Encrypted
              </div>
              <p className="text-[9px] text-slate-500 font-black">
                SERVICE IQ COMMAND • SESSION: {Math.random().toString(36).substring(7).toUpperCase()} • V4.1.2
              </p>
            </div>
          </div>
        );
      default:
        return <div>Not Found</div>;
    }
  };

  const selectedTask = useMemo(() => tasks.find(t => t.id === selectedTaskId) || null, [tasks, selectedTaskId]);

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} integrations={MOCK_INTEGRATIONS} notificationsCount={notifications.filter(n => !n.read).length} isDarkMode={isDarkMode} onIntegrationClick={handleIntegrationClick}>
      {renderContent()}
      <ChatWindow recipient={chatRecipient} onClose={() => setChatRecipient(null)} />
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSave={saveNewTask} 
      />
    </Layout>
  );
};

export default App;
