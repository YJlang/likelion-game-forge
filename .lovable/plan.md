# LIKELION MT GAME NIGHT — 실시간 진행 콘솔

PPT를 대체하는 단순 슬라이드가 아니라, 진행자가 빔프로젝터 앞에서 실제로 게임을 운영하는 인터랙티브 콘솔을 만든다. 백엔드 없이 React + TypeScript + TanStack Router(현 템플릿) + Tailwind + Framer Motion + canvas-confetti + localStorage 만으로 완성한다.

> 참고: 현재 프로젝트는 React Router DOM 대신 TanStack Router 기반(파일 라우팅)으로 셋업되어 있어, 같은 사용자 경험을 더 안정적으로 제공할 수 있게 TanStack Router 파일 라우팅으로 구현한다. 사용자에게 보이는 동작은 동일하다.

## 1. 디자인 시스템

`src/styles.css`의 토큰을 게임쇼 다크 테마로 재정의 (모두 oklch).

- `--background` 다크 네이비 (#0F172A 톤)
- `--card` 슬레이트 (#1E293B 톤)
- `--primary` 라이언 오렌지 (#F97316 톤) / `--primary-foreground` 화이트
- `--accent` 옐로우 (#FACC15 톤)
- `--success` 그린, `--destructive` 레드
- `--gradient-primary`, `--shadow-glow`, `--shadow-elegant` 추가
- 타이포: 디스플레이용 Bebas Neue/Black Han Sans, 본문 Pretendard
- 빔프로젝터 가독성을 위한 `text-display` (8xl+ tracking-tight) 헬퍼 클래스
- 카드: 라운드 2xl, 강한 그림자, 일부 글래스모피즘

## 2. 라우트 / 페이지 구조

`src/routes/` 파일 라우팅 (TanStack Router). 각 라우트는 자체 `head()` 메타 포함.

```
__root.tsx        다크 셸 + 고정 NavBar + Outlet + 우측 하단 미니 점수 도크
index.tsx         홈 대시보드
jukebox.tsx       게임1 노래 맞추기
charades.tsx      게임2 몸으로 말해요
truthlie.tsx      게임3 운영진 진실/거짓
reaction.tsx      게임4 반응으로 행동 맞추기
singing.tsx       게임5 노래 대회 (중요 게임)
scoreboard.tsx    실시간 점수판
final.tsx         최종 결과 발표
```

NavBar: 다크 배경 + 오렌지 액티브 인디케이터(밑줄 슬라이드 애니메이션). 활성 메뉴는 `activeProps`로 강조.

## 3. 페이지 상세

### 홈 (`/`)

- 히어로: "LIKELION MT GAME NIGHT", "4팀 중 최강의 팀은?", 설명문, 그라데이션 + 떠다니는 라이언 이모지 모션
- 진행 순서: 세로 타임라인 카드, 현재 시각 기준 "현재 진행 / 다음 게임" 배지 자동 강조 (수동 선택도 가능)
- 4개 팀 카드 그리드: 팀명, 팀장, 팀원, 현재 누적 점수(localStorage), 팀 색상 액센트
- 점수 룰 카드 (일반 게임 1~4등 / MVP)
- 노래 대회 특별 점수 룰 카드 — "🔥 중요 게임" 강조

### 게임1 주크박스 (`/jukebox`)

- 라운드/현재 참여 팀 선택
- 랜덤 뽑기 → 년도 + 장르만 공개 (제목/가수 숨김)
- 유튜브 링크 새 탭으로 열기
- 정답 보기/숨기기 토글, 맞춤/실패 버튼, 미니 스톱워치
- 팀별 정답 개수 표, 사용된 곡 `usedSongIds` localStorage 관리
- 종료 시 순위 자동 계산(정답 수 → 시간 타이브레이커, 수동 보정 가능) → MVP 선택 → 미리보기 → 확인 모달 → 점수 반영
- mock: `src/data/songs.ts` (K-POP/발라드/알앤비/힙합, 2010~2026)

### 게임2 몸으로 말해요 (`/charades`)

- 팀 선택 → 3분 카운트다운 (시작/일시정지/리셋)
- 키워드 랜덤 뽑기, 기본 숨김 → 보기/숨기기 토글
- +1 정답 / 스킵 버튼
- 팀별 맞춘 개수 + 종료 시간 기록
- 사용된 키워드 localStorage 추적
- 종료 후 순위 자동/수동, MVP, 점수 반영
- mock: `src/data/charades.ts` (동물/학교생활/밈/스포츠/MT 등)

### 게임3 운영진 진실/거짓 (`/truthlie`)

- 문제 번호, 인물 이름, 큰 문장 카드 (중앙 거대 타이포)
- 정답 보기/숨기기, 진실/거짓 강조 표시
- 팀별 정답 체크박스, 다음 문제
- 팀별 정답 누적 표 → 순위 자동 → MVP → 반영
- mock: `src/data/truthlie.ts` (제공된 4명 + 추가 운영진 보강)

### 게임4 반응으로 행동 맞추기 (`/reaction`)

- 팀 선택, 추측자 이름 입력
- 행동 주제 랜덤(숨김 기본), 보기/숨기기
- "❌ 말 금지 / ✅ 환호·야유만" 룰 거대 배너
- 3분 타이머/스톱워치, 시작·일시정지·리셋
- 성공 시 걸린 시간 자동 기록, 실패 처리
- 팀별 시간 표 → 시간순 자동 순위 (실패 팀은 최하위 동률) → MVP → 반영
- mock: `src/data/reactions.ts`

### 게임5 노래 대회 (`/singing`)

- "🔥 중요 게임" 배지 + 점수 규칙 카드 (1등 +6 / +4 / +2 / +1, 불참 -2, 호응 1등 +1)
- 팀별 참가/불참 토글 (불참 시 -2점 빨간 배지)
- 1~4등 드롭다운 + 관객 호응 1등 선택
- 점수 미리보기 표 (각 팀 변동값 +/- 색상)
- 확인 모달 → 점수 반영, 반영 시 confetti 한 번

### 실시간 점수판 (`/scoreboard`)

- 1~4위 자동 정렬, 1위는 왕관 + 골드 글로우 + scale 애니메이션
- 거대 숫자(7xl+), 팀 색상 풀카드
- 펼치기 → 게임별 획득 내역 (게임명, 점수, 보너스, 시각)
- 점수 수동 +/- 버튼 (확인 모달)
- 전체 초기화 버튼 (이중 확인 모달, 데인저 스타일)
- localStorage 저장 상태 인디케이터 ("자동 저장됨 · HH:MM:SS")

### 최종 결과 발표 (`/final`)

- "🏆 최종 우승팀 발표" 거대 타이틀
- "두구두구두구..." 대기 화면 + shake 애니메이션
- "결과 공개" 버튼 → 3초 카운트다운 (3·2·1) → 우승팀 풀스크린 카드 등장
- canvas-confetti 폭죽 (양쪽에서 연속 발사)
- 우승팀 팀장/팀원 표시, 2~4위 라인업, 오늘의 MVP 목록
- "모두 수고하셨습니다!" 마무리

## 4. 공통 컴포넌트 (`src/components/`)

`Navbar`, `GameHeader`(제목 + 룰 접기/펼치기), `TeamCard`, `MiniScoreDock`(전 페이지 우하단 고정), `ScoreBoard`, `Timer`(카운트다운/스톱워치 모드), `RandomPicker`(used 추적 훅 활용), `RankingTable`, `RuleCard`, `ConfirmModal`, `BigButton`(variant: primary/success/danger/ghost), `FinalWinnerCard`, `MvpPicker`, `ScorePreview`.

## 5. 상태 관리 / 데이터

- `src/lib/storage.ts`: 타입 안전 localStorage 헬퍼 (`useLocalStorage<T>` 훅)
- `src/store/useGameStore.ts`: zustand(가벼움) 또는 context + reducer 로 통합 상태
  - `teams[]` (점수 + 게임별 내역)
  - `usedSongIds`, `usedCharadeIds`, `usedReactionIds`, `usedTruthIds`
  - `mvpLog[]` (게임명, 팀, 인물명, 시각)
  - `scoreLog[]` (게임명, 팀명, 점수, 보너스, 반영시각)
  - `singingState` (참가여부, 순위, 호응 1등)
- 모든 변경은 자동으로 localStorage 동기화. 새로고침 후 동일 상태 유지.
- 팀 데이터는 사용자가 준 명단 그대로 (`src/data/teams.ts`).

## 6. 점수 자동 계산

```ts
일반: [4,3,2,1]
노래대회: [6,4,2,1] + 불참 -2 + 호응1등 +1
MVP 보너스: +1
```

점수 반영은 항상: 미리보기 → ConfirmModal → apply → log push → toast.

## 7. 인터랙션 / 디테일

- Framer Motion: 페이지 페이드/슬라이드, 카드 hover scale, 점수 카운트업, 우승 카드 spring entrance
- canvas-confetti: 최종 발표 + 노래 대회 반영 완료
- 키보드 단축키: Space(타이머 토글), R(리셋), Enter(다음 문제) — 진행자 편의
- 토스트: 점수 반영, 초기화, 저장 알림 (sonner)

## 8. 기술 노트 (기술 사용자용)

- 라우팅: TanStack Router 파일 라우팅 (현 템플릿). NavBar는 `Link` + `activeProps`.
- 상태: zustand + persist 미들웨어로 localStorage 자동 직렬화 (key: `mt-likelion-v1`).
- 타이머: `useEffect` + `requestAnimationFrame` 또는 `setInterval(100ms)`로 0.1초 단위.
- 유튜브: 임베드 대신 `window.open(url, "_blank")` (정답 노출 방지).
- canvas-confetti: `bun add canvas-confetti @types/canvas-confetti`.
- zustand: `bun add zustand`.
- 모든 색상은 `src/styles.css` 토큰 사용 (직접 hex 금지).
- 빌드 타깃은 노트북/빔프로젝터 (≥1280px) 우선, 모바일에서도 깨지지 않게 grid 반응형.

## 9. 작업 순서 (구현 시)

1. 디자인 토큰 + 폰트 + NavBar + 셸
2. zustand 스토어 + 팀/룰/mock data 파일
3. 공통 컴포넌트 (Timer, BigButton, ConfirmModal, MiniScoreDock, RankingTable...)
4. 홈 → 점수판 → 최종 발표 (점수 흐름 검증)
5. 게임 1~5 순서대로 구현
6. confetti, 단축키, 마이크로 애니메이션 마감
7. 1280×800 빔 시뮬레이션으로 가독성 QA

승인하시면 바로 구현 시작합니다.
