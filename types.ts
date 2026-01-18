
export interface ExamPart {
  id: string;
  title: string;
  latex: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  message: string;
  error?: string;
}

export enum ExamSection {
  PART_1 = "PHẦN I. Câu trắc nghiệm nhiều phương án chọn",
  PART_2 = "PHẦN II. Câu trắc nghiệm đúng sai",
  PART_3 = "PHẦN III. Câu trắc nghiệm trả lời ngắn"
}
