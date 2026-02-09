// app/types.ts
export interface GlossaryTerm {
  Category: string;
  "Short Form"?: string;
  "Full Form (English)": string;
  Description?: string;
  Chinese?: string;
  "Description (Chinese)"?: string;
  // 为了防止数据丢失，我们允许索引其他任意列
  [key: string]: string | undefined;
}