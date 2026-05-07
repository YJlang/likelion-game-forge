export interface ReactionAction {
  id: number;
  action: string;
  difficulty: "easy" | "normal" | "hard";
}

export const REACTIONS: ReactionAction[] = [
  { id: 1, action: "편의점에서 삼각김밥 고르는 사람", difficulty: "easy" },
  { id: 2, action: "교수님께 출석 인정 부탁하는 사람", difficulty: "normal" },
  { id: 3, action: "MT 다음날 아침에 살아남은 사람", difficulty: "hard" },
  { id: 4, action: "노래방에서 고음 실패한 사람", difficulty: "normal" },
  { id: 5, action: "과제 제출 1분 전의 대학생", difficulty: "normal" },
  { id: 6, action: "PPT 발표 도중 노트북이 꺼진 사람", difficulty: "hard" },
  { id: 7, action: "엘리베이터에서 모르는 사람과 단둘이 있는 사람", difficulty: "normal" },
  { id: 8, action: "런닝맨에서 이름표 떼는 사람", difficulty: "easy" },
  { id: 9, action: "백엔드 서버가 터졌을 때의 개발자", difficulty: "hard" },
  { id: 10, action: "치킨 배달 기다리는 사람", difficulty: "easy" },
];
