export interface TruthLie {
  id: number;
  person: string;
  statement: string;
  answer: "진실" | "거짓";
}

export const TRUTH_LIES: TruthLie[] = [
  { id: 1, person: "권오현", statement: "나는 사람 만나는 걸 안 좋아한다.", answer: "거짓" },
  { id: 2, person: "홍민경", statement: "나는 운전 면허가 없다.", answer: "진실" },
  { id: 3, person: "조승민", statement: "나는 요리 마스터다.", answer: "거짓" },
  { id: 4, person: "김민규", statement: "나는 노래방 가면 마이크를 안 잡는다.", answer: "거짓" },
  { id: 5, person: "김소은", statement: "나는 매운 음식을 전혀 못 먹는다.", answer: "거짓" },
  { id: 6, person: "조준형", statement: "나는 새벽 5시에 일어나서 운동한다.", answer: "진실" },
  { id: 7, person: "권오현", statement: "나는 컴퓨터 없이 일주일을 살 수 있다.", answer: "거짓" },
  { id: 8, person: "홍민경", statement: "나는 디저트 가게를 차리는 게 꿈이다.", answer: "진실" },
];
