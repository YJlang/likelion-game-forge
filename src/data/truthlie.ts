export interface TruthLie {
  id: number;
  person: string;
  statement: string;
  answer: "진실" | "거짓";
}

export const TRUTH_LIES: TruthLie[] = [
  {
    id: 101,
    person: "구혜원",
    statement: "나는 전교생 앞에서 공연을 한 적이 있다.",
    answer: "진실",
  },
  { id: 102, person: "구혜원", statement: "나는 오보에를 연주할 줄 안다.", answer: "거짓" },
  { id: 103, person: "구혜원", statement: "나는 숏컷을 해본 적이 있다.", answer: "진실" },
  {
    id: 104,
    person: "구혜원",
    statement: "나는 지하철에서 졸다가 종점까지 가본 적이 있다.",
    answer: "거짓",
  },
  { id: 105, person: "조준형", statement: "나는 마라톤을 뛴 적이 있다.", answer: "진실" },
  { id: 106, person: "조준형", statement: "나는 연애를 해본 적이 없다.", answer: "거짓" },
  { id: 107, person: "조준형", statement: "내 마지막 연애는 20살이다.", answer: "진실" },
  { id: 108, person: "조준형", statement: "나는 CC를 해본 적이 있다.", answer: "거짓" },
  {
    id: 109,
    person: "권오현",
    statement: "나는 항공운항과를 다니다가 컴공으로 왔다.",
    answer: "진실",
  },
  { id: 110, person: "권오현", statement: "나는 고향이 제주도이다.", answer: "진실" },
  { id: 111, person: "권오현", statement: "나는 기독교 신자다.", answer: "진실" },
  { id: 112, person: "권오현", statement: "나는 미술상을 탄 적이 있다.", answer: "진실" },
  { id: 113, person: "권오현", statement: "나는 사람 만나는 걸 안 좋아한다.", answer: "거짓" },
  { id: 114, person: "홍민경", statement: "나는 이빨 하나가 가짜다.", answer: "진실" },
  { id: 115, person: "홍민경", statement: "나는 기독교다.", answer: "진실" },
  { id: 116, person: "홍민경", statement: "나는 운전 면허가 없다.", answer: "진실" },
  { id: 117, person: "홍민경", statement: "나는 탈색한 적이 없다.", answer: "거짓" },
  { id: 118, person: "김민규", statement: "나는 기독교 관련 학과였다.", answer: "진실" },
  {
    id: 119,
    person: "김민규",
    statement: "나는 크리스마스 또는 연초에 교회를 간다.",
    answer: "진실",
  },
  { id: 120, person: "김민규", statement: "나는 노래방 가면 마이크를 안 잡는다.", answer: "거짓" },
  { id: 121, person: "김민규", statement: "나는 차가 3대다.", answer: "거짓" },
  { id: 122, person: "조승민", statement: "나는 여자친구한테 테토다.", answer: "진실" },
  { id: 123, person: "조승민", statement: "나는 요리 마스터다.", answer: "거짓" },
  { id: 124, person: "김소은", statement: "나는 아나운서 준비를 했다.", answer: "거짓" },
  { id: 125, person: "김소은", statement: "나는 인스타 계정이 6개이다.", answer: "진실" },
  { id: 126, person: "윤준하", statement: "나는 서울시 대표 수영선수였다.", answer: "진실" },
  {
    id: 127,
    person: "윤준하",
    statement: "나는 살면서 여자친구를 10명 넘게 사귀어봤다.",
    answer: "거짓",
  },
  { id: 128, person: "노태경", statement: "나는 육상 선수를 했었다.", answer: "진실" },
  { id: 129, person: "노태경", statement: "나는 비타민을 매일 챙겨 먹는다.", answer: "진실" },
  { id: 130, person: "노태경", statement: "나는 담배를 피다가 끊었다.", answer: "거짓" },
  { id: 131, person: "노태경", statement: "나는 학고를 받은 적이 있다.", answer: "거짓" },
  { id: 132, person: "노태경", statement: "나는 체대를 준비한 적이 있다.", answer: "거짓" },
];
