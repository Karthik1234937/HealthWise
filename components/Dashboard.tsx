import React from 'react';
import { FileText, Activity, User, Plus, Calendar, BarChart2, ArrowRight } from 'lucide-react';
import { LabReportData, UserProfile, ResultStatus } from '../types';

interface DashboardProps {
  user: UserProfile;
  reports: LabReportData[];
  onNavigate: (page: string) => void;
  onClearHistory?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, reports, onNavigate, onClearHistory }) => {
  const normalResultsCount = reports.reduce((acc, report) => {
    return acc + report.results.filter(r => r.status === ResultStatus.NORMAL).length;
  }, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your health today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
            <div className="text-sm text-gray-500">Health Reports</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{normalResultsCount}</div>
            <div className="text-sm text-gray-500">Normal Results</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">Complete</div>
            <div className="text-sm text-gray-500">Profile Status</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-800">Quick Actions</h2>
          {onClearHistory && reports.length > 0 && (
            <button 
              onClick={onClearHistory}
              className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
            >
              Clear Test History
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => onNavigate('upload')}
            className="p-4 bg-medical-50 hover:bg-medical-100 rounded-xl flex flex-col items-center justify-center gap-3 transition-colors group"
          >
            <div className="p-2 bg-white rounded-full text-medical-600 shadow-sm group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-700">New Analysis</span>
          </button>

          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-xl flex flex-col items-center justify-center gap-3 transition-colors group">
            <div className="p-2 bg-white rounded-full text-green-600 shadow-sm group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-700">Schedule Visit</span>
          </button>

          <button 
            onClick={() => onNavigate('reports')}
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl flex flex-col items-center justify-center gap-3 transition-colors group"
          >
            <div className="p-2 bg-white rounded-full text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-700">View Reports</span>
          </button>

          <button 
            onClick={() => onNavigate('metrics')}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl flex flex-col items-center justify-center gap-3 transition-colors group"
          >
            <div className="p-2 bg-white rounded-full text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
              <BarChart2 className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-700">Health Metrics</span>
          </button>
        </div>
      </div>

      {/* Recent Reports Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
        <h2 className="font-semibold text-gray-800 mb-6">Your Health Reports</h2>
        
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="font-medium text-gray-900">No Reports Yet</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
              Start by uploading your first health report to get personalized insights.
            </p>
            <button 
              onClick={() => onNavigate('upload')}
              className="mt-6 px-4 py-2 bg-medical-600 text-white text-sm font-medium rounded-lg hover:bg-medical-700 transition-colors"
            >
              Upload Your First Report
            </button>
          </div>
        ) : (
          <div className="space-y-3">
             {reports.map((report, idx) => (
               <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-medical-50 rounded-lg text-medical-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{report.labName || 'General Lab Report'}</h4>
                      <p className="text-xs text-gray-500">{report.reportDate || report.uploadDate}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onNavigate('reports')}
                    className="p-2 text-gray-400 hover:text-medical-600 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;