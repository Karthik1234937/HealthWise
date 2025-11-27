import { supabase } from '../lib/supabase';
import { UserProfile, LabReportData } from '../types';

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data as UserProfile;
};

export const saveUserProfile = async (userId: string, profile: UserProfile) => {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...profile
    });

  if (error) throw error;
};

export const getReports = async (userId: string): Promise<LabReportData[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }

  // Map database fields to frontend types if necessary (snake_case to camelCase is handled mostly automatically if exact match, but let's be safe)
  return data.map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    labName: row.lab_name,
    reportDate: row.report_date,
    uploadDate: row.upload_date,
    summary: row.summary,
    abnormalities: row.abnormalities,
    results: row.results,
    clinicalInterpretation: row.clinical_interpretation,
    dietaryRecommendations: row.dietary_recommendations
  }));
};

export const saveReport = async (userId: string, report: LabReportData) => {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      user_id: userId,
      lab_name: report.labName,
      report_date: report.reportDate,
      upload_date: report.uploadDate,
      summary: report.summary,
      abnormalities: report.abnormalities,
      results: report.results,
      clinical_interpretation: report.clinicalInterpretation,
      dietary_recommendations: report.dietaryRecommendations
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteReport = async (reportId: string) => {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId);

  if (error) throw error;
};

export const clearAllReports = async (userId: string) => {
    const { error } = await supabase
        .from('reports')
        .delete()
        .eq('user_id', userId);
    
    if (error) throw error;
}
