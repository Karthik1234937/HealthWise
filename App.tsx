import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  LayoutDashboard, 
  Files, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X,
  FileText
} from 'lucide-react';
import FileUpload from './components/FileUpload';
import ResultsView from './components/ResultsView';
import ChatAssistant from './components/ChatAssistant';
import Dashboard from './components/Dashboard';
import HealthMetrics from './components/HealthMetrics';
import ReportsList from './components/ReportsList';
import Settings from './components/Settings';
import Login from './components/Login';
import { analyzeLabReport } from './services/geminiService';
import { LabReportData, UserProfile, BackupData } from './types';
import { supabase } from './lib/supabase';
import { getUserProfile, getReports, saveReport, deleteReport, clearAllReports } from './services/dbService';

// Fallback Initial User
const INITIAL_USER: UserProfile = {
  name: "Guest User",
  age: 0,
  gender: "Not Specified",
  height: 0,
  weight: 0,
  blood_type: "Unknown",
  email: "",
  phone: ""
};

type Page = 'dashboard' | 'upload' | 'results' | 'reports' | 'metrics' | 'settings';

function App() {
  const [session, setSession] = useState<any>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [labData, setLabData] = useState<LabReportData | null>(null);
  const [reports, setReports] = useState<LabReportData[]>([]);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [isLoading, setIsLoading] = useState(true);

  // Auth State Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserData(session.user.id);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserData(session.user.id);
      else {
        setReports([]);
        setUser(INITIAL_USER);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    const profile = await getUserProfile(userId);
    if (profile) setUser(profile);
    
    const userReports = await getReports(userId);
    setReports(userReports);
  };

  const handleLogin = (newUser?: UserProfile) => {
    // Session state handled by onAuthStateChange
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActivePage('dashboard');
  };

  const handleDeleteReport = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      await deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
      if (labData?.id === id) {
        setLabData(null);
        setActivePage('reports');
      }
    }
  };

  const handleClearReports = async () => {
    if (window.confirm('Are you sure you want to delete ALL reports? This action cannot be undone.') && session) {
      await clearAllReports(session.user.id);
      setReports([]);
      setLabData(null);
      setActivePage('dashboard');
    }
  };

  // Import Data (For migration or restoring backups)
  const handleImportData = (data: BackupData) => {
     // For now, this just updates local state, but ideally should sync to Supabase
     // This feature is less critical with cloud DB but good for moving data from local-only version
     setUser(data.user);
     setReports(data.reports);
     alert("Data imported to view. Note: Use 'Save' to persist to cloud database.");
  };

  const handleResetData = async () => {
      // Deletes cloud data
      await handleClearReports();
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const data = await analyzeLabReport(file);
      
      // Add metadata
      data.uploadDate = new Date().toLocaleDateString();
      data.patientName = user.name; 
      
      const reportNumber = reports.length + 1;
      if (!data.labName || data.labName === 'Unknown Lab') {
        data.labName = `Report-${reportNumber}`;
      }
      
      if (session) {
        const savedReport = await saveReport(session.user.id, data);
        // Add the ID returned from DB
        if (savedReport) {
            // Map DB result back to LabReportData if needed, specifically the ID
            const newReport = { ...data, id: savedReport.id };
            setLabData(newReport);
            setReports(prev => [newReport, ...prev]);
        }
      } else {
        setLabData(data);
        setReports(prev => [data, ...prev]);
      }
      
      setActivePage('results');
    } catch (error) {
      console.error(error);
      alert("Failed to analyze document. Please ensure the backend server is running and the API key is valid.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewReport = (report: LabReportData) => {
    setLabData(report);
    setActivePage('results');
  };

  const NavItem = ({ icon: Icon, label, id, active }: { icon: any, label: string, id: Page, active: boolean }) => (
    <button 
      onClick={() => {
        setActivePage(id);
        setSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-medical-50 text-medical-700 font-medium shadow-sm' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-medical-600' : 'text-gray-400'}`} />
      <span>{label}</span>
    </button>
  );

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading HealthWise...</div>;
  }

  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-10 h-10 bg-medical-600 rounded-xl flex items-center justify-center shadow-lg shadow-medical-500/30">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">HealthWise</h1>
              <p className="text-xs text-medical-600 font-medium">Cloud Connected</p>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            <NavItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              id="dashboard" 
              active={activePage === 'dashboard'} 
            />
             <NavItem 
              icon={Files} 
              label="Reports" 
              id="reports" 
              active={activePage === 'reports'} 
            />
            <NavItem 
              icon={Activity} 
              label="Test Results" 
              id="upload" 
              active={activePage === 'upload' || activePage === 'results'} 
            />
             <NavItem 
              icon={FileText} 
              label="Health Metrics" 
              id="metrics" 
              active={activePage === 'metrics'} 
            />
            
            <div className="pt-4 mt-4 border-t border-gray-100">
               <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">System</p>
               <NavItem 
                icon={SettingsIcon} 
                label="Settings" 
                id="settings" 
                active={activePage === 'settings'} 
              />
            </div>
          </nav>

          <div className="mt-auto">
             <button 
               onClick={handleLogout}
               className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-600 transition-colors mt-6 w-full"
             >
               <LogOut className="w-5 h-5" />
               <span className="font-medium">Sign Out</span>
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0 no-print">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            {(activePage === 'results' || activePage === 'upload') && (
               <button 
                 onClick={() => setActivePage('dashboard')}
                 className="text-sm text-gray-500 hover:text-medical-600 flex items-center gap-1"
               >
                 ← Back to Dashboard
               </button>
            )}
          </div>

          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-medical-100 text-medical-600 font-bold flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-gray-50">
                {user.name.charAt(0).toUpperCase()}
             </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-10 scrollbar-hide">
          <div className="max-w-6xl mx-auto">
            
            {/* Dashboard View */}
            {activePage === 'dashboard' && (
              <Dashboard 
                user={user} 
                reports={reports} 
                onNavigate={(page) => setActivePage(page as Page)} 
                onClearHistory={handleClearReports}
              />
            )}

            {/* Health Metrics View */}
            {activePage === 'metrics' && (
              <HealthMetrics user={user} />
            )}

            {/* Settings View */}
            {activePage === 'settings' && (
              <Settings 
                user={user} 
                reports={reports} 
                onImportData={handleImportData}
                onResetData={handleResetData}
              />
            )}

            {/* Reports List View */}
            {activePage === 'reports' && (
              <ReportsList 
                reports={reports} 
                onViewReport={handleViewReport}
                onUploadNew={() => setActivePage('upload')}
                onDeleteReport={handleDeleteReport}
                onClearAll={handleClearReports}
              />
            )}

            {/* Upload View */}
            {activePage === 'upload' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="text-center space-y-2 mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Upload Test Reports</h1>
                    <p className="text-gray-500 max-w-lg mx-auto">
                      Upload blood test reports (PDF, Images)
                    </p>
                 </div>

                 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
                 </div>
              </div>
            )}

            {/* Results View */}
            {activePage === 'results' && labData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="lg:col-span-2 print-full-width">
                  <ResultsView data={labData} />
                </div>
                
                <div className="space-y-6 no-print">
                   <ChatAssistant labData={labData} />
                   
                   <div className="bg-medical-900 rounded-xl p-6 text-white shadow-xl">
                      <h3 className="font-semibold text-lg mb-2">Need a consultation?</h3>
                      <button 
                        onClick={() => window.print()}
                        className="w-full py-2 bg-white text-medical-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                      >
                         Export PDF
                      </button>
                   </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
