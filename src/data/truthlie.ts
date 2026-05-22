export interface TruthLiePair {
  id: number;
  person: string;
  trueStatement: string;
  falseStatement: string;
  trueAnswer?: "진실" | "거짓";
  falseAnswer?: "진실" | "거짓";
}

export const TRUTH_LIES: TruthLiePair[] = [
  {
    id: 201,
    person: "구혜원",
    trueStatement: "나는 전교생 앞에서 공연을 한 적이 있다.",
    falseStatement: "나는 오보에를 연주할 줄 안다.",
  },
  {
    id: 202,
    person: "구혜원",
    trueStatement: "나는 숏컷을 해본 적이 있다.",
    falseStatement: "나는 지하철에서 졸다가 종점까지 가본 적이 있다.",
  },
  {
    id: 203,
    person: "조준형",
    trueStatement: "나는 마라톤을 뛴 적이 있다.",
    falseStatement: "나는 연애를 해본 적이 없다.",
  },
  {
    id: 204,
    person: "조준형",
    trueStatement: "내 마지막 연애는 20살이다.",
    falseStatement: "나는 CC를 해본 적이 있다.",
  },
  {
    id: 205,
    person: "조승민",
    trueStatement: "어릴 때 꿈이 유치원 선생님이었다.",
    falseStatement: "편의점에서 계산 안 하고 나가다가 잡힌 적 있다.",
    trueAnswer: "거짓",
    falseAnswer: "거짓",
  },
  {
    id: 206,
    person: "김소은",
    trueStatement: "나는 인스타 계정이 6개이다.",
    falseStatement: "나는 아나운서 준비를 했다.",
  },
  {
    id: 207,
    person: "윤준하",
    trueStatement: "나는 서울시 대표 수영선수였다.",
    falseStatement: "나는 살면서 여자친구를 10명 넘게 사귀어봤다.",
  },
  {
    id: 208,
    person: "윤준하",
    trueStatement: "나는 바디프로필을 찍어본 적이 있다.",
    falseStatement: "나는 여름을 제일 좋아한다.",
  },
  {
    id: 209,
    person: "노태경",
    trueStatement: "나는 육상 선수를 했었다.",
    falseStatement: "나는 담배를 피다가 끊었다.",
  },
  {
    id: 210,
    person: "노태경",
    trueStatement: "나는 비타민을 매일 챙겨 먹는다.",
    falseStatement: "나는 학고를 받은 적이 있다.",
  },
];
