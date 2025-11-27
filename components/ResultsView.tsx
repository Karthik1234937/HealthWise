import React, { useMemo } from 'react';
import { LabReportData, ResultStatus, TestCategory, LabResult } from '../types';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Droplet, 
  HeartPulse, 
  TestTube, 
  FileText,
  AlertCircle,
  TrendingUp,
  Info,
  Heart
} from 'lucide-react';

interface ResultsViewProps {
  data: LabReportData;
}

const ResultsView: React.FC<ResultsViewProps> = ({ data }) => {
  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: Record<string, LabResult[]> = {};
    data.results.forEach(result => {
      const cat = result.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(result);
    });
    return groups;
  }, [data.results]);

  const abnormalResults = data.results.filter(
    r => r.status === ResultStatus.HIGH || r.status === ResultStatus.LOW || r.status === ResultStatus.CRITICAL
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case TestCategory.CBC: return <Droplet className="w-4 h-4" />;
      case TestCategory.LIPID: return <HeartPulse className="w-4 h-4" />;
      case TestCategory.LIVER: return <Activity className="w-4 h-4" />;
      case TestCategory.KIDNEY: return <Activity className="w-4 h-4" />;
      default: return <TestTube className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: ResultStatus) => {
    switch (status) {
      case ResultStatus.NORMAL: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case ResultStatus.HIGH: return 'text-red-600 bg-red-50 border-red-100';
      case ResultStatus.LOW: return 'text-blue-600 bg-blue-50 border-blue-100';
      case ResultStatus.CRITICAL: return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getStatusIcon = (status: ResultStatus) => {
    switch (status) {
      case ResultStatus.NORMAL: return <CheckCircle className="w-4 h-4" />;
      case ResultStatus.HIGH: return <TrendingUp className="w-4 h-4" />;
      case ResultStatus.LOW: return <TrendingUp className="w-4 h-4 rotate-180" />;
      case ResultStatus.CRITICAL: return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* 1. Scanned Test Values Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Scanned Test Values from Your Reports</h2>
        </div>
        <p className="text-sm text-gray-500 -mt-2 mb-6">
          Here are the exact values we extracted from your uploaded test reports and their medical reference ranges:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {Object.entries(groupedResults).map(([category, results]) => (
            <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden break-inside-avoid">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className="text-gray-500">{getCategoryIcon(category)}</span>
                <h3 className="font-semibold text-gray-800 text-sm">{category}</h3>
              </div>
              <div className="p-4 space-y-3">
                {results.map((result, idx) => {
                  const isNormal = result.status === ResultStatus.NORMAL;
                  return (
                    <div 
                      key={idx} 
                      className={`relative p-3 rounded-lg border flex items-center justify-between ${
                        isNormal ? 'bg-white border-gray-100' : 'bg-red-50 border-red-100'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between mb-1">
                          <span className={`font-semibold text-sm ${isNormal ? 'text-gray-700' : 'text-red-700'}`}>
                            {result.testName}
                          </span>
                          <span className={`text-lg font-bold ${isNormal ? 'text-emerald-600' : 'text-red-600'}`}>
                            {result.value} <span className="text-xs font-normal text-gray-500 ml-0.5">{result.unit}</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Normal Range: {result.referenceRange}</span>
                          <div className={`flex items-center gap-1.5 font-medium px-2 py-0.5 rounded-full ${getStatusColor(result.status as ResultStatus)}`}>
                            {getStatusIcon(result.status as ResultStatus)}
                            <span>{result.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Report Scanning Verification */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-5 break-inside-avoid">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-full text-blue-600 mt-0.5">
             <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 text-sm mb-2">Report Scanning Verification</h3>
            <ul className="space-y-1.5">
              <li className="text-xs text-blue-800 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                Successfully Scanned: <span className="font-semibold">{data.results.length} parameters</span> from your test reports
              </li>
              <li className="text-xs text-blue-800 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Categories Analyzed: <span className="font-semibold">{Object.keys(groupedResults).length} test categories</span>
              </li>
              <li className="text-xs text-blue-800 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                Abnormal Values Found: <span className="font-semibold">{abnormalResults.length} parameters</span> outside normal ranges
              </li>
            </ul>
            <p className="text-[10px] text-blue-600 mt-3 opacity-80">
              Each extracted value has been compared against established medical reference ranges from WHO, AHA, and clinical guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Split Section: Abnormal Values & Interpretations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Abnormal Values Detected */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
             <AlertTriangle className="w-5 h-5 text-orange-500" />
             <h3 className="font-bold text-gray-900">Abnormal Values Detected</h3>
          </div>
          
          {abnormalResults.length === 0 ? (
            <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center text-green-800">
               <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
               <p className="text-sm font-medium">No abnormal values detected. Great job!</p>
            </div>
          ) : (
            abnormalResults.map((result, idx) => (
              <div key={idx} className="bg-yellow-50/80 rounded-xl border border-yellow-200 overflow-hidden break-inside-avoid">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-600"><Activity className="w-4 h-4" /></span>
                      <h4 className="font-bold text-yellow-900">{result.testName}</h4>
                    </div>
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded uppercase tracking-wide">
                      {result.status === ResultStatus.HIGH ? 'High' : 'Low'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-yellow-700 uppercase mb-0.5">Your Value</p>
                      <p className="font-bold text-gray-900 text-lg">{result.value}</p>
                    </div>
                    <div>
                      <p className="text-xs text-yellow-700 uppercase mb-0.5">Normal Range</p>
                      <p className="font-medium text-gray-600">{result.referenceRange}</p>
                    </div>
                  </div>

                  {result.clinicalSignificance && (
                    <div className="mb-3">
                      <p className="text-xs font-bold text-gray-700 mb-1">Clinical Significance:</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{result.clinicalSignificance}</p>
                    </div>
                  )}

                  {result.possibleCauses && result.possibleCauses.length > 0 && (
                     <div>
                       <p className="text-xs font-bold text-gray-700 mb-1">Possible Causes:</p>
                       <div className="flex flex-wrap gap-2">
                         {result.possibleCauses.map((cause, i) => (
                           <span key={i} className="px-2 py-1 bg-white border border-yellow-100 text-gray-600 text-xs rounded-md shadow-sm">
                             {cause}
                           </span>
                         ))}
                       </div>
                     </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Clinical Interpretations */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
             <TrendingUp className="w-5 h-5 text-blue-600" />
             <h3 className="font-bold text-gray-900">Clinical Interpretations</h3>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full break-inside-avoid">
            <div className="flex justify-between items-center mb-4">
               <h4 className="font-bold text-gray-800 flex items-center gap-2">
                 <Activity className="w-4 h-4 text-blue-500" />
                 {data.clinicalInterpretation ? 'Analysis Summary' : 'Report Summary'}
               </h4>
               <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                 {abnormalResults.length > 0 ? 'Attention Needed' : 'Routine'}
               </span>
            </div>

            {data.clinicalInterpretation ? (
               <div className="space-y-5">
                 <div>
                   <p className="text-sm font-semibold text-gray-700 mb-2">Key Findings:</p>
                   <ul className="space-y-1">
                     {data.clinicalInterpretation.keyFindings.map((item, i) => (
                       <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                         <span className="mt-1.5 w-1 h-1 bg-blue-400 rounded-full shrink-0" />
                         {item}
                       </li>
                     ))}
                   </ul>
                 </div>
                 
                 <div>
                   <p className="text-sm font-semibold text-gray-700 mb-2">Clinical Implications:</p>
                   <ul className="space-y-1">
                     {data.clinicalInterpretation.clinicalImplications.map((item, i) => (
                       <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                         <span className="mt-1.5 w-1 h-1 bg-red-400 rounded-full shrink-0" />
                         {item}
                       </li>
                     ))}
                   </ul>
                 </div>

                 <div className="pt-4 border-t border-gray-100">
                   <p className="text-sm font-semibold text-emerald-700 mb-2">Recommended Actions:</p>
                   <ul className="space-y-2">
                     {data.clinicalInterpretation.recommendedActions.map((item, i) => (
                       <li key={i} className="text-sm text-gray-700 flex items-start gap-2 bg-emerald-50/50 p-2 rounded-lg">
                         <ArrowRightCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                         {item}
                       </li>
                     ))}
                   </ul>
                 </div>
               </div>
            ) : (
              <p className="text-sm text-gray-600 leading-relaxed">
                {data.summary || "No clinical interpretation available."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Personalized Recommendations */}
      {data.dietaryRecommendations && data.dietaryRecommendations.length > 0 && (
        <div className="space-y-4 pt-4 break-inside-avoid">
           <div className="flex items-center gap-2">
             <h3 className="font-bold text-gray-900">Personalized Recommendations</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {data.dietaryRecommendations.map((rec, idx) => (
               <div key={idx} className="bg-red-50/50 rounded-xl p-5 border border-red-100 break-inside-avoid">
                 <div className="flex items-center gap-2 mb-3">
                   <Heart className="w-4 h-4 text-red-500" />
                   <h4 className="font-bold text-gray-800">{rec.topic}</h4>
                   <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded">
                     {rec.priority} Priority
                   </span>
                 </div>
                 
                 <p className="text-sm text-gray-600 mb-4 font-medium italic">
                   "{rec.action}"
                 </p>

                 <div>
                   <p className="text-xs font-bold text-gray-500 uppercase mb-2">What to do:</p>
                   <ul className="space-y-1">
                     {rec.items.map((item, i) => (
                       <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                         <span className="text-red-400">•</span>
                         {item}
                       </li>
                     ))}
                   </ul>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

// Helper component since I can't import ArrowRightCircle easily in the map above without defining it or importing it
const ArrowRightCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default ResultsView;