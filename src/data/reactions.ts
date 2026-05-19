export interface ReactionAction {
  id: number;
  action: string;
}

export const REACTIONS: ReactionAction[] = [
  { id: 1, action: "물 마시기" },
  { id: 2, action: "손하트 하기" },
  { id: 3, action: "제자리 뛰기" },
  { id: 4, action: "박수치기" },
  { id: 5, action: "점프하기" },
  { id: 6, action: "한 바퀴 돌기" },
  { id: 7, action: "손 흔들기" },
  { id: 8, action: "브이 하기" },
  { id: 9, action: "윙크하기" },
];
