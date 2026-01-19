// File này dùng cho PHƯƠNG ÁN 2 - Gọi API route an toàn
// API key được bảo vệ ở server-side

export const convertImageToLatex = async (base64Images: string[]): Promise<string> => {
  try {
    const response = await fetch('/api/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ images: base64Images })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.details || 'Failed to convert image to LaTeX');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Conversion failed');
    }
    
    return data.latex;
  } catch (error: any) {
    console.error('Error calling convert API:', error);
    throw new Error(`API Error: ${error.message}`);
  }
};
