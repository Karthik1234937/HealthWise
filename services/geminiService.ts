import { LabReportData } from "../types";

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

export const analyzeLabReport = async (file: File): Promise<LabReportData> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze report');
    }

    const data = await response.json();
    return data as LabReportData;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const chatWithHealthBot = async (history: {role: string, parts: {text: string}[]}[], message: string, context?: LabReportData): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history,
        message,
        context
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get chat response');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm sorry, I'm having trouble connecting to the server right now.";
  }
};