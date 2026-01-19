import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from "@google/generative-ai";

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

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*').end();
  }

  // Chỉ cho phép POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { images } = req.body;

    // Validate input
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Invalid images data. Expected non-empty array.' });
    }

    // Lấy API key từ environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured');
      return res.status(500).json({ 
        error: 'API key not configured. Please add GEMINI_API_KEY to Vercel environment variables.' 
      });
    }

    // Khởi tạo Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: 0.1,
      }
    });

    // Chuẩn bị image parts
    const imageParts = images.map((img: string) => ({
      inlineData: {
        mimeType: "image/jpeg",
        data: img.split(',')[1] || img
      }
    }));

    // Gọi Gemini API
    const result = await model.generateContent([
      ...imageParts,
      "Hãy chuyển toàn bộ nội dung trong (các) hình ảnh này sang LaTeX ex-test theo đúng 3 phần của BGD 2025 như đã hướng dẫn."
    ]);

    const response = await result.response;
    const text = response.text();

    // Trả về kết quả
    return res.status(200).json({ 
      latex: text,
      success: true 
    });

  } catch (error: any) {
    console.error('Error in convert API:', error);
    
    return res.status(500).json({ 
      error: 'Failed to convert image to LaTeX',
      details: error.message,
      success: false
    });
  }
}

// Cấu hình cho Vercel Serverless Function
export const config = {
  maxDuration: 60, // Timeout 60 giây
};
