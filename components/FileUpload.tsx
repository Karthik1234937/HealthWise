import React, { useCallback, useState } from 'react';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateAndUpload = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setError("Please upload an image (JPG, PNG) or PDF.");
        return;
    }
    // Basic size check (e.g. 10MB)
    if (file.size > 10 * 1024 * 1024) {
        setError("File size too large. Max 10MB.");
        return;
    }
    onFileUpload(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  }, [onFileUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`relative group rounded-xl border-2 border-dashed p-10 transition-all duration-200 ease-in-out text-center cursor-pointer
          ${dragActive ? 'border-medical-600 bg-medical-50' : 'border-gray-300 hover:border-medical-500 hover:bg-gray-50'}
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept="image/*,application/pdf"
          disabled={isProcessing}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {isProcessing ? (
             <div className="flex flex-col items-center animate-pulse">
                <Loader2 className="w-12 h-12 text-medical-600 animate-spin mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">Analyzing Document...</h3>
                <p className="text-sm text-gray-500">Extracting lab values and validating ranges</p>
             </div>
          ) : (
            <>
              <div className="p-4 rounded-full bg-medical-100 group-hover:scale-110 transition-transform duration-200">
                <Upload className="w-8 h-8 text-medical-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Click or drag medical report to upload
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Supports JPG, PNG, PDF (Max 10MB)
                </p>
              </div>
              <div className="flex gap-4 mt-4">
                <div className="flex items-center text-xs text-gray-400">
                  <FileText className="w-4 h-4 mr-1" /> CBC
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <FileText className="w-4 h-4 mr-1" /> Lipids
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <FileText className="w-4 h-4 mr-1" /> Metabolic
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
