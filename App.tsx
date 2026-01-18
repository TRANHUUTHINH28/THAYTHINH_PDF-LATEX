
import React, { useState, useCallback } from 'react';
import { FileUploader } from './components/FileUploader';
import { LatexDisplay } from './components/LatexDisplay';
import { ProcessingStatus } from './components/ProcessingStatus';
import { convertImageToLatex } from './services/geminiService';
import { ProcessingState } from './types';

// PDF.js worker setup
// @ts-ignore
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const App: React.FC = () => {
  const [latexResult, setLatexResult] = useState<string>('');
  const [status, setStatus] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    message: 'Sẵn sàng'
  });

  const convertPdfToImages = async (file: File): Promise<string[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const images: string[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      setStatus(prev => ({ 
        ...prev, 
        message: `Đang trích xuất trang ${i}/${pdf.numPages}...`,
        progress: (i / pdf.numPages) * 30 
      }));
      
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) continue;
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({ canvasContext: context, viewport }).promise;
      images.push(canvas.toDataURL('image/jpeg', 0.8));
    }
    return images;
  };

  const handleFileSelect = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    setStatus({ isProcessing: true, progress: 5, message: 'Bắt đầu xử lý...' });
    setLatexResult('');

    try {
      let base64Images: string[] = [];

      for (const file of files) {
        if (file.type === 'application/pdf') {
          const pdfImages = await convertPdfToImages(file);
          base64Images = [...base64Images, ...pdfImages];
        } else if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          const p = new Promise<string>((resolve) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
          base64Images.push(await p);
        }
      }

      setStatus(prev => ({ ...prev, progress: 40, message: 'Đang gửi dữ liệu đến AI (Gemini 3 Pro)...' }));
      
      const result = await convertImageToLatex(base64Images);
      
      setLatexResult(result);
      setStatus({ isProcessing: false, progress: 100, message: 'Hoàn thành!' });
    } catch (error: any) {
      console.error(error);
      setStatus({ 
        isProcessing: false, 
        progress: 0, 
        message: 'Lỗi xử lý', 
        error: error.message || 'Đã có lỗi xảy ra trong quá trình chuyển đổi.' 
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-teal-700 text-white shadow-lg p-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <svg className="w-8 h-8 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">PDF to ex-test LaTeX</h1>
              <p className="text-teal-100 text-sm">Chuyên gia số hóa đề thi BGD 2025</p>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <span className="text-xs bg-teal-600 px-3 py-1 rounded-full border border-teal-500">Powered by Gemini 3 Pro</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8">
        <section className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <h2 className="text-lg font-semibold text-teal-800 flex items-center">
                <span className="bg-teal-100 text-teal-700 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
                Tải lên tài liệu
              </h2>
              <p className="text-gray-600 text-sm">
                Hỗ trợ file PDF hoặc Hình ảnh (JPEG, PNG). Hãy đảm bảo hình ảnh rõ nét và các phần đáp án đúng được gạch chân để AI nhận diện chính xác.
              </p>
              <FileUploader onFilesSelected={handleFileSelect} disabled={status.isProcessing} />
            </div>
            
            <div className="flex-1 space-y-4">
              <h2 className="text-lg font-semibold text-teal-800 flex items-center">
                <span className="bg-teal-100 text-teal-700 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
                Trạng thái hệ thống
              </h2>
              <ProcessingStatus state={status} />
            </div>
          </div>
        </section>

        {latexResult && (
          <section className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-semibold text-teal-800 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="bg-teal-100 text-teal-700 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">3</span>
                Kết quả LaTeX ex-test
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(latexResult);
                  alert('Đã sao chép mã LaTeX!');
                }}
                className="text-sm bg-teal-50 text-teal-700 px-4 py-2 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                Sao chép mã
              </button>
            </h2>
            <LatexDisplay content={latexResult} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-teal-100 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>© 2024 LaTeX Converter Pro - Định dạng 2025 BGD Việt Nam</p>
          <div className="flex justify-center space-x-4 mt-2">
            <span>\\begin{"{ex}"}</span>
            <span>\\choice</span>
            <span>\\choiceTF</span>
            <span>\\True</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
