export interface Charade {
  id: number;
  category: string;
  keyword: string;
  difficulty: "easy" | "normal" | "hard";
}

export const CHARADES: Charade[] = [
  { id: 1, category: "MT", keyword: "삼겹살 굽기", difficulty: "easy" },
  { id: 2, category: "MT", keyword: "쌈 싸 먹기", difficulty: "easy" },
  { id: 3, category: "MT", keyword: "숯불 피우기", difficulty: "normal" },
  { id: 4, category: "MT", keyword: "단체 사진 찍기", difficulty: "easy" },
  { id: 5, category: "MT", keyword: "짐 풀기", difficulty: "easy" },
  { id: 6, category: "MT", keyword: "다음날 아침 기상", difficulty: "normal" },
  { id: 7, category: "노래방", keyword: "고음 지르기", difficulty: "easy" },
  { id: 8, category: "노래방", keyword: "마이크 양보 안 하기", difficulty: "normal" },
  { id: 9, category: "노래방", keyword: "탬버린 흔들기", difficulty: "easy" },
  { id: 10, category: "노래방", keyword: "댄스 브레이크", difficulty: "normal" },
  { id: 11, category: "학교생활", keyword: "지각해서 뛰어가기", difficulty: "easy" },
  { id: 12, category: "학교생활", keyword: "과제 마감 1분 전", difficulty: "normal" },
  { id: 13, category: "학교생활", keyword: "팀플 발표하기", difficulty: "normal" },
  { id: 14, category: "학교생활", keyword: "출석 체크 대답하기", difficulty: "easy" },
  { id: 15, category: "일상", keyword: "라면 먹기", difficulty: "easy" },
  { id: 16, category: "일상", keyword: "버스 놓치기", difficulty: "easy" },
  { id: 17, category: "일상", keyword: "휴대폰 배터리 1%", difficulty: "normal" },
  { id: 18, category: "일상", keyword: "잠에서 덜 깬 사람", difficulty: "easy" },
  { id: 19, category: "스포츠", keyword: "축구 골 세리머니", difficulty: "easy" },
  { id: 20, category: "스포츠", keyword: "야구 홈런 치기", difficulty: "easy" },
  { id: 21, category: "스포츠", keyword: "농구 자유투", difficulty: "easy" },
  { id: 22, category: "스포츠", keyword: "볼링 스트라이크", difficulty: "normal" },
  { id: 23, category: "동물", keyword: "펭귄 걷기", difficulty: "easy" },
  { id: 24, category: "동물", keyword: "강아지 산책", difficulty: "easy" },
  { id: 25, category: "동물", keyword: "고양이 세수", difficulty: "normal" },
];
