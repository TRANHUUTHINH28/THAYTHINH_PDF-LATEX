
import React from 'react';
import { ProcessingState } from '../types';

interface ProcessingStatusProps {
  state: ProcessingState;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ state }) => {
  const { isProcessing, progress, message, error } = state;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-medium ${error ? 'text-red-600' : 'text-teal-700'}`}>
          {message}
        </span>
        <span className="text-xs font-semibold text-teal-600">
          {Math.round(progress)}%
        </span>
      </div>
      
      <div className="w-full bg-teal-100 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out rounded-full ${error ? 'bg-red-500' : 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]'}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {isProcessing && (
        <div className="flex items-center space-x-3 text-xs text-gray-500 animate-pulse">
          <svg className="animate-spin h-4 w-4 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Đang sử dụng Gemini 3 Pro để phân tích cấu trúc đề thi...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {!isProcessing && !error && progress === 100 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start space-x-3 animate-in zoom-in duration-300">
          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-xs text-green-700">Tài liệu đã được chuyển đổi thành công sang định dạng ex-test!</p>
        </div>
      )}
    </div>
  );
};
