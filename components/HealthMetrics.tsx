import React from 'react';
import { UserProfile } from '../types';
import { Ruler, Weight, Activity, Calendar, Heart } from 'lucide-react';

interface HealthMetricsProps {
  user: UserProfile;
}

const HealthMetrics: React.FC<HealthMetricsProps> = ({ user }) => {
  const bmi = (user.weight / ((user.height / 100) * (user.height / 100))).toFixed(1);
  
  const getBmiStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-600' };
    return { label: 'Obese', color: 'text-red-600' };
  };

  const bmiStatus = getBmiStatus(parseFloat(bmi));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Health Metrics</h1>
        <p className="text-gray-500 mt-1">Track your personal health indicators and progress</p>
      </div>

      {/* Personal Information */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="flex items-center text-sm font-semibold text-medical-600 uppercase tracking-wider mb-6">
          <Heart className="w-4 h-4 mr-2" /> Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase">Name</label>
            <div className="text-lg font-medium text-gray-900 mt-1">{user.name}</div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase">Gender</label>
            <div className="text-lg font-medium text-gray-900 mt-1">{user.gender}</div>
          </div>
        </div>
      </div>

      {/* Physical Metrics Grid */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="flex items-center text-sm font-semibold text-medical-600 uppercase tracking-wider mb-6">
          <Activity className="w-4 h-4 mr-2" /> Physical Metrics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Height */}
          <div className="p-4 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
              <Ruler className="w-5 h-5" />
            </div>
            <div className="text-sm text-gray-500 mb-1">Height</div>
            <div className="text-xl font-bold text-gray-900">{user.height} cm</div>
          </div>

          {/* Weight */}
          <div className="p-4 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
              <Weight className="w-5 h-5" />
            </div>
            <div className="text-sm text-gray-500 mb-1">Weight</div>
            <div className="text-xl font-bold text-gray-900">{user.weight} kg</div>
          </div>

          {/* BMI */}
          <div className="p-4 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-sm text-gray-500 mb-1">BMI</div>
            <div className="text-xl font-bold text-gray-900">{bmi}</div>
            <div className={`text-xs font-medium ${bmiStatus.color}`}>{bmiStatus.label}</div>
          </div>

          {/* Age */}
          <div className="p-4 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3">
              <Heart className="w-5 h-5" />
            </div>
            <div className="text-sm text-gray-500 mb-1">Age</div>
            <div className="text-xl font-bold text-gray-900">{user.age} years</div>
          </div>
        </div>
      </div>

      {/* Lifestyle Information */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-6">Lifestyle Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase">Smoking Status</label>
            <div className="text-base font-medium text-gray-900 mt-1">Never</div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase">Alcohol Consumption</label>
            <div className="text-base font-medium text-gray-900 mt-1">None</div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase">Physical Activity Level</label>
            <div className="text-base font-medium text-gray-900 mt-1">Sedentary</div>
          </div>
        </div>
      </div>

      {/* Health Tips */}
      <div className="bg-medical-50 p-6 rounded-xl border border-medical-100">
        <h2 className="font-semibold text-medical-800 mb-4">Health Tips</h2>
        <ul className="space-y-3">
          <li className="flex items-start text-sm text-medical-900">
            <span className="mr-2">•</span>
            Maintain a balanced diet rich in fruits and vegetables
          </li>
          <li className="flex items-start text-sm text-medical-900">
            <span className="mr-2">•</span>
            Exercise regularly - aim for at least 30 minutes of moderate activity daily
          </li>
          <li className="flex items-start text-sm text-medical-900">
            <span className="mr-2">•</span>
            Stay hydrated by drinking at least 8 glasses of water per day
          </li>
          <li className="flex items-start text-sm text-medical-900">
            <span className="mr-2">•</span>
            Get 7-9 hours of quality sleep each night
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HealthMetrics;