import React, { useRef, useState } from 'react';
import { 
  Download, 
  Upload, 
  Trash2, 
  Database, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  FileJson,
  RefreshCw,
  HelpCircle,
  ArrowRight,
  Laptop
} from 'lucide-react';
import { UserProfile, LabReportData, BackupData } from '../types';

interface SettingsProps {
  user: UserProfile;
  reports: LabReportData[];
  onImportData: (data: BackupData) => void;
  onResetData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, reports, onImportData, onResetData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const handleExport = () => {
    const backup: BackupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      user,
      reports
    };

    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Format filename: healthwise_backup_YYYY-MM-DD.json
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `healthwise_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = event.target?.result as string;
        const data = JSON.parse(jsonContent) as BackupData;
        
        // Basic validation
        if (!data.user || !Array.isArray(data.reports)) {
          throw new Error("Invalid backup file format");
        }

        onImportData(data);
        setImportStatus('success');
        setImportMessage('Data restored successfully!');
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setImportStatus('idle');
          setImportMessage('');
        }, 3000);
      } catch (error) {
        console.error(error);
        setImportStatus('error');
        setImportMessage('Failed to restore data. Invalid file.');
      }
    };
    reader.readAsText(file);
    
    // Clear input so same file can be selected again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleResetClick = () => {
    if (window.confirm('CRITICAL WARNING: This will permanently delete ALL your reports and profile data from this device. This action cannot be undone. Are you sure?')) {
        onResetData();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings & Data Management</h1>
        <p className="text-gray-500 mt-1">Manage your local data, create backups, or restore from a file.</p>
      </div>

      {/* Data Storage Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start gap-4">
        <div className="p-2 bg-blue-100 rounded-full text-blue-600 mt-1">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-900">Local Storage Only</h3>
          <p className="text-sm text-blue-800 mt-1 leading-relaxed">
            HealthWise stores your medical data locally on this <strong>specific browser</strong> for maximum privacy. 
            We do not have a central server. If you switch browsers (e.g., Chrome to Firefox) or computers, 
            your data will <strong>not</strong> appear automatically.
          </p>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4">
            <Download className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Backup Data</h3>
          <p className="text-sm text-gray-500 mb-6 flex-1">
            Download a secure copy of your profile and all medical reports. 
            Use this to transfer data to another browser.
          </p>
          <button 
            onClick={handleExport}
            className="w-full py-2.5 bg-white border border-green-200 text-green-700 font-medium rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
          >
            <FileJson className="w-4 h-4" />
            Download Backup (.json)
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4">
            <Upload className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Restore Data</h3>
          <p className="text-sm text-gray-500 mb-6 flex-1">
            Upload a previously saved backup file to restore your account history on this new browser.
          </p>
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden" 
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 bg-medical-600 text-white font-medium rounded-lg hover:bg-medical-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Select Backup File
          </button>

          {importStatus === 'success' && (
             <div className="mt-3 text-sm text-green-600 flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4" /> {importMessage}
             </div>
          )}
          {importStatus === 'error' && (
             <div className="mt-3 text-sm text-red-600 flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4" /> {importMessage}
             </div>
          )}
        </div>
      </div>

      {/* Guide: How to Transfer */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-gray-500" />
          How to transfer data to another browser?
        </h3>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 text-sm text-gray-600">
          <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 w-full">
            <span className="font-bold text-medical-600 block mb-1">Step 1: Old Browser</span>
            Click "Download Backup" above. Save the <code>.json</code> file to your computer.
          </div>
          <ArrowRight className="hidden md:block text-gray-400" />
          <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 w-full">
            <span className="font-bold text-purple-600 block mb-1">Step 2: New Browser</span>
            Open HealthWise. Go to Settings. Click "Select Backup File" and pick the file.
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
        <h3 className="text-lg font-semibold text-red-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Danger Zone
        </h3>
        <p className="text-sm text-gray-500 mb-6 max-w-2xl">
          Resetting the application will permanently delete your user profile and all scanned reports from this specific browser. 
          Make sure you have a backup if you want to save your data.
        </p>
        <button 
            onClick={handleResetClick}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 font-medium rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors flex items-center gap-2"
        >
            <Trash2 className="w-4 h-4" />
            Reset Application
        </button>
      </div>
      
      <div className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
         <Shield className="w-3 h-3" />
         <span>HealthWise uses client-side encryption. Your data never leaves your device unless you export it.</span>
      </div>
    </div>
  );
};

export default Settings;