
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Bạn là một chuyên gia chuyển đổi tài liệu toán học/khoa học sang định dạng LaTeX chuyên nghiệp.
Nhiệm vụ: Chuyển đổi hình ảnh đề thi sang mã LaTeX theo đúng cấu trúc ex-test (phổ biến tại Việt Nam) cho đề thi mẫu BGD 2025.

Cấu trúc yêu cầu:
1. PHẦN I: Trắc nghiệm 4 lựa chọn.
   - Sử dụng môi trường: 
   \\begin{ex} ... 
   \\choice
   {A}
   {B}
   {C}
   {D} 
   \\loigiai{giải chi tiết}
   \\end{ex}
   - Rất quan trọng: Nếu trong đề gốc, phương án nào được GẠCH CHÂN (hoặc in đậm biểu thị đáp án), hãy thay chữ cái đó bằng \\True (Ví dụ: \\choice{\\True A}{B}{C}{D}).

2. PHẦN II: Trắc nghiệm Đúng/Sai.
   - Mỗi câu hỏi có 4 ý a, b, c, d.
   - Sử dụng môi trường: 
   \\begin{ex} ... 
   \\choiceTF
   {\\True ý đúng}
   {ý 2}
   {ý 3}
   {ý 4} ... 
   \\loigiai{giải chi tiết theo cấu trúc
   \\begin{itemchoice}...
   \\itemch{ý 1}
   \\itemch{ý 2}
   \\itemch{ý 3}
   \\itemch{ý 4}}
   \\end{ex}
   - Dựa vào gạch chân trong ảnh để xác định \\True (Đúng) hoặc \\False (Sai).

3. PHẦN III: Câu hỏi trả lời ngắn.
   - Sử dụng môi trường: 
   \\begin{ex} ... 
   \\shortant[oly]{đáp án}
   \\loigiai{giải chi tiết}
   \\end{ex}

Yêu cầu định dạng đặc biệt:
- Hình ảnh: Bất kỳ chỗ nào có hình vẽ, đồ thị, sơ đồ, hãy đặt mã: \\includegraphics[width=4cm]{Images/hinhX} (trong đó X là số thứ tự hình tăng dần trong toàn bộ tài liệu).
- Công thức: Sử dụng $...$ cho công thức nội dòng và \\[ ... \\] cho công thức độc lập.
- Không được thêm các đoạn text giải thích ngoài mã LaTeX.
- Trả về mã LaTeX sạch sẽ, không nằm trong block markdown \`\`\`latex.
`;

export const convertImageToLatex = async (base64Images: string[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  
  const contents = base64Images.map(img => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: img.split(',')[1] || img
    }
  }));

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      {
        parts: [
          ...contents.map(c => ({ inlineData: c.inlineData })),
          { text: "Hãy chuyển toàn bộ nội dung trong (các) hình ảnh này sang LaTeX ex-test theo đúng 3 phần của BGD 2025 như đã hướng dẫn." }
        ]
      }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.1,
    }
  });

  return response.text || "";
};
