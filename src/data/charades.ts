export interface Charade {
  id: number;
  category: string;
  keyword: string;
  difficulty: "easy" | "normal" | "hard";
}

export const CHARADES: Charade[] = [
  { id: 101, category: "동물", keyword: "펭귄", difficulty: "easy" },
  { id: 102, category: "동물", keyword: "원숭이", difficulty: "easy" },
  { id: 103, category: "동물", keyword: "캥거루", difficulty: "easy" },
  { id: 104, category: "동물", keyword: "문어", difficulty: "normal" },
  { id: 105, category: "스포츠", keyword: "축구", difficulty: "easy" },
  { id: 106, category: "스포츠", keyword: "야구", difficulty: "easy" },
  { id: 107, category: "스포츠", keyword: "양궁", difficulty: "easy" },
  { id: 108, category: "스포츠", keyword: "피겨스케이팅", difficulty: "normal" },
  { id: 109, category: "직업", keyword: "미용사", difficulty: "easy" },
  { id: 110, category: "직업", keyword: "의사", difficulty: "easy" },
  { id: 111, category: "직업", keyword: "요리사", difficulty: "easy" },
  { id: 112, category: "직업", keyword: "사진작가", difficulty: "normal" },
  { id: 113, category: "일상", keyword: "세수하기", difficulty: "easy" },
  { id: 114, category: "일상", keyword: "라면 먹기", difficulty: "easy" },
  { id: 115, category: "일상", keyword: "버스 놓치기", difficulty: "normal" },
  { id: 116, category: "일상", keyword: "비 맞기", difficulty: "normal" },
  { id: 117, category: "MT", keyword: "고기 굽기", difficulty: "easy" },
  { id: 118, category: "MT", keyword: "쌈 싸기", difficulty: "easy" },
  { id: 119, category: "MT", keyword: "단체 사진", difficulty: "normal" },
  { id: 120, category: "MT", keyword: "모기 잡기", difficulty: "normal" },
  { id: 121, category: "예능", keyword: "인사이드 아웃 슬픔이", difficulty: "hard" },
  { id: 122, category: "예능", keyword: "겨울왕국 엘사", difficulty: "normal" },
  { id: 123, category: "예능", keyword: "스파이더맨", difficulty: "easy" },
  { id: 124, category: "예능", keyword: "좀비", difficulty: "easy" },
  { id: 125, category: "노래방", keyword: "탬버린", difficulty: "easy" },
  { id: 126, category: "노래방", keyword: "고음 폭발", difficulty: "normal" },
  { id: 127, category: "노래방", keyword: "아이돌 엔딩 포즈", difficulty: "normal" },
  { id: 128, category: "노래방", keyword: "댄스 브레이크", difficulty: "normal" },
];
