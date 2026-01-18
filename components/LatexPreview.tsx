
import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface LatexPreviewProps {
  content: string;
}

export const LatexPreview: React.FC<LatexPreviewProps> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Render Math inside the container
    const processMath = () => {
      const elements = containerRef.current?.querySelectorAll('.math-inline, .math-display');
      elements?.forEach((el) => {
        const text = el.getAttribute('data-expr') || '';
        const isDisplay = el.classList.contains('math-display');
        try {
          katex.render(text, el as HTMLElement, {
            throwOnError: false,
            displayMode: isDisplay
          });
        } catch (e) {
          console.error(e);
        }
      });
    };

    processMath();
  }, [content]);

  // Simple parser to turn ex-test structure into UI
  const parseLatex = (text: string) => {
    // Replace inline math $...$
    let processed = text.replace(/\$([^\$]+)\$/g, '<span class="math-inline" data-expr="$1"></span>');
    // Replace display math \[...\]
    processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, '<div class="math-display" data-expr="$1"></div>');
    
    // Split by environment \begin{ex}
    const blocks = processed.split(/\\begin\{ex\}/);
    const result: React.ReactNode[] = [];

    // Add preamble (Part titles)
    const preamble = blocks[0];
    if (preamble.trim()) {
      result.push(
        <div key="preamble" className="mb-6 whitespace-pre-line font-bold text-center text-lg" dangerouslySetInnerHTML={{ __html: preamble }}></div>
      );
    }

    blocks.slice(1).forEach((block, idx) => {
      const [content, ...rest] = block.split(/\\end\{ex\}/);
      
      // Extract choice/choiceTF
      const isChoiceTF = content.includes('\\choiceTF');
      const isChoice = content.includes('\\choice');
      const isShortAns = content.includes('\\shortant');

      let questionText = content;
      let choices: string[] = [];
      let shortAns = '';

      if (isChoice) {
        const parts = content.split(/\\choice/);
        questionText = parts[0];
        // Match {A}{B}{C}{D}
        const matches = parts[1]?.match(/\{([\s\S]*?)\}/g);
        if (matches) choices = matches.map(m => m.slice(1, -1));
      } else if (isChoiceTF) {
        const parts = content.split(/\\choiceTF/);
        questionText = parts[0];
        const matches = parts[1]?.match(/\{([\s\S]*?)\}/g);
        if (matches) choices = matches.map(m => m.slice(1, -1));
      } else if (isShortAns) {
        const parts = content.split(/\\shortant/);
        questionText = parts[0];
        const match = parts[1]?.match(/\[.*?\]\{(.*?)\}/);
        if (match) shortAns = match[1];
      }

      // Handle \includegraphics
      questionText = questionText.replace(/\\includegraphics\[.*?\]\{(.*?)\}/g, '<div class="my-4 border-2 border-dashed border-teal-200 bg-teal-50 p-8 text-center rounded-lg text-teal-600 font-bold uppercase tracking-widest">[ Hình ảnh: $1 ]</div>');

      result.push(
        <div key={idx} className="mb-8 p-4 border-l-4 border-teal-500 bg-white shadow-sm rounded-r-lg">
          <div className="font-semibold mb-2 flex items-start">
            <span className="text-teal-700 mr-2 flex-shrink-0">Câu {idx + 1}:</span>
            <div dangerouslySetInnerHTML={{ __html: questionText.replace(/\\loigiai\{[\s\S]*?\}/g, '') }}></div>
          </div>

          {isChoice && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 ml-6">
              {choices.map((c, i) => {
                const label = String.fromCharCode(65 + i);
                const isTrue = c.includes('\\True');
                return (
                  <div key={i} className={`flex items-start space-x-2 p-2 rounded ${isTrue ? 'bg-teal-50 ring-1 ring-teal-200' : ''}`}>
                    <span className={`font-bold ${isTrue ? 'text-teal-700 underline underline-offset-4' : ''}`}>{label}.</span>
                    <div dangerouslySetInnerHTML={{ __html: c.replace('\\True', '').trim() }}></div>
                  </div>
                );
              })}
            </div>
          )}

          {isChoiceTF && (
            <div className="mt-4 ml-6 overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 p-2 text-left">Nội dung</th>
                    <th className="border border-gray-200 p-2 text-center w-16">Đúng</th>
                    <th className="border border-gray-200 p-2 text-center w-16">Sai</th>
                  </tr>
                </thead>
                <tbody>
                  {choices.map((c, i) => {
                    const label = String.fromCharCode(97 + i);
                    const isTrue = c.includes('\\True');
                    return (
                      <tr key={i}>
                        <td className="border border-gray-200 p-2">
                          <span className="font-bold mr-2">{label})</span>
                          <span dangerouslySetInnerHTML={{ __html: c.replace(/\\(True|False)/g, '').trim() }}></span>
                        </td>
                        <td className="border border-gray-200 p-2 text-center">
                          {isTrue && <span className="text-teal-600 font-bold">✓</span>}
                        </td>
                        <td className="border border-gray-200 p-2 text-center">
                          {!isTrue && c.includes('\\False') && <span className="text-red-500 font-bold">✓</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {isShortAns && (
            <div className="mt-4 ml-6 flex items-center space-x-2">
              <span className="text-gray-500 italic">Trả lời:</span>
              <div className="border-b-2 border-dotted border-teal-400 min-w-[100px] text-center font-bold text-teal-800" dangerouslySetInnerHTML={{ __html: shortAns }}></div>
            </div>
          )}
        </div>
      );

      // Add what was after the environment (Part headers maybe)
      if (rest.join('').trim()) {
        result.push(
          <div key={`after-${idx}`} className="my-10 text-center font-bold text-xl text-teal-900 border-y py-4 border-teal-100 uppercase tracking-widest" dangerouslySetInnerHTML={{ __html: rest.join('') }}></div>
        );
      }
    });

    return result;
  };

  return (
    <div className="bg-white border shadow-xl mx-auto max-w-[210mm] min-h-[297mm] p-[20mm] exam-paper text-gray-900" ref={containerRef}>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold uppercase mb-2">ĐỀ THI MINH HỌA - BGD 2025</h1>
        <div className="flex justify-between text-sm px-10 italic">
          <span>Môn: Toán học</span>
          <span>Thời gian: 90 phút</span>
        </div>
        <div className="w-1/2 mx-auto border-b-2 border-black mt-4"></div>
      </div>
      
      {parseLatex(content)}
    </div>
  );
};
