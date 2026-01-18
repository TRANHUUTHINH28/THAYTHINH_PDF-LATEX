
import React from 'react';

interface LatexDisplayProps {
  content: string;
}

export const LatexDisplay: React.FC<LatexDisplayProps> = ({ content }) => {
  return (
    <div className="relative group">
      <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto font-mono text-sm leading-relaxed text-teal-300 shadow-inner max-h-[600px] overflow-y-auto custom-scrollbar">
        <pre className="whitespace-pre-wrap break-words">
          {content.split('\n').map((line, i) => {
            // Basic syntax highlighting simulation
            if (line.startsWith('\\begin') || line.startsWith('\\end')) {
              return <span key={i} className="text-pink-400 block">{line}</span>;
            }
            if (line.includes('\\choice') || line.includes('\\choiceTF')) {
              return <span key={i} className="text-yellow-300 block">{line}</span>;
            }
            if (line.includes('\\True')) {
              return <span key={i} className="text-green-400 block">{line}</span>;
            }
            if (line.includes('\\includegraphics')) {
              return <span key={i} className="text-blue-400 block">{line}</span>;
            }
            return <span key={i} className="block">{line}</span>;
          })}
        </pre>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a202c;
          border-radius: 0 12px 12px 0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2d3748;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4a5568;
        }
      `}</style>
    </div>
  );
};
