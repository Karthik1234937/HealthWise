import React from 'react';
import { LabReportData } from '../types';
import { FileText, Calendar, ArrowRight, AlertTriangle, Trash2, Download } from 'lucide-react';

interface ReportsListProps {
  reports: LabReportData[];
  onViewReport: (report: LabReportData) => void;
  onUploadNew: () => void;
  onDeleteReport: (id: string) => void;
  onClearAll: () => void;
}

const ReportsList: React.FC<ReportsListProps> = ({ 
  reports, 
  onViewReport, 
  onUploadNew,
  onDeleteReport,
  onClearAll
}) => {

  const handleDownload = (report: LabReportData, e: React.MouseEvent) => {
    e.stopPropagation();
    const jsonString = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.labName?.replace(/\s+/g, '_') || 'report'}_${report.reportDate || 'date'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Reports</h1>
          <p className="text-gray-500 mt-1">View and manage your health analysis reports</p>
        </div>
        <div className="flex gap-3">
          {reports.length > 0 && (
            <button 
              onClick={onClearAll}
              className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
            >
              Delete All
            </button>
          )}
          <button 
            onClick={onUploadNew}
            className="px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors text-sm font-medium"
          >
            New Analysis
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No Reports Yet</h3>
          <p className="text-gray-500 mt-2 mb-6">
            You haven't generated any health reports yet. Start by analyzing your blood test results.
          </p>
          <button 
            onClick={onUploadNew}
            className="px-6 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
          >
            Go to Upload
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report, idx) => (
            <div 
              key={report.id || idx} 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-medical-200 transition-all group"
            >
              <div className="flex items-start justify-between">
                {/* Clickable Area for Viewing */}
                <div 
                  className="flex items-start gap-4 flex-1 cursor-pointer"
                  onClick={() => onViewReport(report)}
                >
                  <div className="p-3 bg-medical-50 rounded-xl text-medical-600 group-hover:bg-medical-100 transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {report.labName || 'General Health Report'}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {report.reportDate || report.uploadDate}
                      </span>
                      <span>•</span>
                      <span>{report.results.length} Tests Analyzed</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                   <button
                    onClick={(e) => handleDownload(report, e)}
                    className="p-2 text-gray-400 hover:text-medical-600 hover:bg-medical-50 rounded-lg transition-colors"
                    title="Export JSON"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (report.id) onDeleteReport(report.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Report"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => onViewReport(report)}
                    className="p-2 text-gray-400 hover:text-medical-600 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {report.abnormalities && report.abnormalities.length > 0 && (
                 <div className="mt-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg cursor-pointer" onClick={() => onViewReport(report)}>
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="line-clamp-1">
                      {report.abnormalities.length} abnormalities detected: {report.abnormalities.join(', ')}
                    </p>
                 </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsList;