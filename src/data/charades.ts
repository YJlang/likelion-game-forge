export interface Charade {
  id: number;
  category: string;
  keyword: string;
  difficulty: "easy" | "normal" | "hard";
}

export const CHARADES: Charade[] = [
  { id: 1, category: "동물", keyword: "고양이", difficulty: "easy" },
  { id: 2, category: "동물", keyword: "캥거루", difficulty: "normal" },
  { id: 3, category: "동물", keyword: "펭귄", difficulty: "easy" },
  { id: 4, category: "동물", keyword: "악어", difficulty: "normal" },
  { id: 5, category: "학교생활", keyword: "과제 제출 직전", difficulty: "normal" },
  { id: 6, category: "학교생활", keyword: "출석체크 도망가는 학생", difficulty: "normal" },
  { id: 7, category: "학교생활", keyword: "지각해서 뛰어가는 학생", difficulty: "easy" },
  { id: 8, category: "학교생활", keyword: "조별과제 빌런", difficulty: "hard" },
  { id: 9, category: "밈", keyword: "마라탕후루", difficulty: "normal" },
  { id: 10, category: "밈", keyword: "삐끼삐끼", difficulty: "easy" },
  { id: 11, category: "밈", keyword: "원조 마라탕", difficulty: "hard" },
  { id: 12, category: "밈", keyword: "할매니얼", difficulty: "hard" },
  { id: 13, category: "스포츠", keyword: "축구 골 세리머니", difficulty: "easy" },
  { id: 14, category: "스포츠", keyword: "야구 홈런", difficulty: "easy" },
  { id: 15, category: "스포츠", keyword: "농구 덩크슛", difficulty: "easy" },
  { id: 16, category: "스포츠", keyword: "탁구 스매싱", difficulty: "normal" },
  { id: 17, category: "MT", keyword: "다음날 아침에 살아남은 사람", difficulty: "hard" },
  { id: 18, category: "MT", keyword: "삼겹살 굽는 사람", difficulty: "easy" },
  { id: 19, category: "MT", keyword: "노래방에서 고음 도전", difficulty: "normal" },
  { id: 20, category: "MT", keyword: "보드게임 패배자", difficulty: "normal" },
  { id: 21, category: "직업", keyword: "버스 기사님", difficulty: "easy" },
  { id: 22, category: "직업", keyword: "백엔드 개발자 디버깅", difficulty: "hard" },
  { id: 23, category: "직업", keyword: "택배 기사님", difficulty: "easy" },
  { id: 24, category: "사물", keyword: "에어팟", difficulty: "normal" },
  { id: 25, category: "사물", keyword: "전기 주전자", difficulty: "hard" },
];
