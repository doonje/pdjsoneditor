# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

PDJsonEditor는 SvelteKit과 Svelte 5 runes를 사용하여 구축된 JSON 시각화 및 편집 도구입니다. CodeMirror 기반 에디터와 @xyflow/svelte 기반 인터랙티브 그래프 뷰를 동시에 제공합니다.

## 개발 명령어

### 기본 명령어
```bash
# 개발 서버 시작 (포트 5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### 코드 품질 검사
```bash
# TypeScript 타입 체크
npm run check

# TypeScript 타입 체크 (watch 모드)
npm run check:watch

# ESLint 검사
npm run lint

# ESLint 자동 수정
npm run lint:fix

# Prettier 포맷팅
npm run format

# Prettier 포맷 검사
npm run format:check
```

### 테스트
```bash
# E2E 테스트 실행
npm run test:e2e

# E2E 테스트 UI 모드
npm run test:e2e:ui

# E2E 테스트 디버그 모드
npm run test:e2e:debug

# E2E 테스트 리포트 보기
npm run test:e2e:report

# 테스트 서버 (HTTP 요청 테스트용)
npm run test:server
```

### 국제화
```bash
# typesafe-i18n 타입 생성
npm run typesafe-i18n
```

## 아키텍처

### 핵심 개념

**Multi-Tab State Management**
- `src/lib/stores/tabs.svelte.ts`: Svelte 5 runes 기반 전역 탭 스토어
- 각 탭은 독립적인 JSON 콘텐츠, 에디터 상태, 그래프 상태, HTTP 요청 설정을 관리
- localStorage를 통한 자동 저장 및 세션 복원
- `TabData` 인터페이스에 모든 탭 관련 상태가 정의되어 있음

**Reactive Data Flow**
- Svelte 5 runes (`$state`, `$derived`, `$effect`) 사용
- `+page.svelte`에서 `editorValue`와 `tabsStore` 간 양방향 동기화
- JSON 파싱은 500ms debounce 적용하여 성능 최적화
- 탭 변경 시 캐시된 `parsedJson` 사용으로 즉각적인 전환 제공

**Graph Layout with Web Worker**
- `src/lib/workers/graphLayout.worker.ts`: Dagre 레이아웃을 별도 워커에서 실행
- 메인 스레드 블로킹 없이 대규모 JSON 그래프 렌더링
- 진행률 리포팅 (`build`, `layout` 단계) 지원
- 노드 높이 측정 및 컬럼 오버랩 조정 로직 포함

**Component Communication**
- `nodeClick` 커스텀 이벤트: 그래프 노드 클릭 시 에디터 탐색
- `tabChanged` 커스텀 이벤트: 탭 전환 시 그래프 재렌더링 트리거
- CodeMirror `syntaxTree` API를 사용한 JSON 경로 탐색 (`JsonEditor.svelte`)

### 주요 컴포넌트

**src/lib/components/JsonEditor.svelte**
- CodeMirror 6 기반 JSON 에디터
- `navigateToPath(path)`: JSON 경로(예: "data.users[0].name")로 에디터 커서 이동
- Syntax highlighting, validation, 접기/펼치기 지원

**src/lib/components/JsonGraph.svelte**
- @xyflow/svelte 기반 그래프 시각화
- `CompactNode.svelte`: 기본형 값을 그룹화하여 표시하는 커스텀 노드
- `expandedNodes`, `showAllItemsNodes` Set을 통한 노드 확장 상태 관리
- Web Worker로 레이아웃 계산 위임

**src/lib/components/TabBar.svelte**
- 멀티탭 UI 관리
- 탭 추가, 닫기, 이름 변경, 복제 기능
- 키보드 단축키 지원 (Cmd/Ctrl+T, W, Tab 등)

### 상태 관리 구조

```
tabsStore (전역, Svelte 5 runes)
├─ tabs: TabData[]
│  ├─ jsonContent: string
│  ├─ parsedJson: unknown (캐시)
│  ├─ editorState: { cursorPosition, selection, scrollPosition }
│  ├─ graphState: { expandedNodes, showAllItemsNodes, zoom, pan }
│  └─ requestSettings: { url, method, headers, body, ... }
└─ activeTabId: string

+page.svelte (로컬)
├─ editorValue: string (activeTab과 양방향 동기)
├─ parsedJson: JsonValue | null
└─ UI 상태 (isLoading, isDialogOpen, ...)
```

### HTTP 요청 처리

**src/lib/services/http.ts**
- `requestJson()`: HTTP 요청 통합 함수
- GET, POST, PUT, DELETE, PATCH 메서드 지원
- 커스텀 헤더, body, raw text 전송 옵션
- 에디터 콘텐츠를 body로 사용하는 옵션 (`useEditorContent`)
- 응답을 JSON 파싱하거나 raw text로 반환

### 국제화 (i18n)

- `typesafe-i18n` 사용 (타입 안전 번역)
- `src/i18n/en/index.ts`, `src/i18n/ko/index.ts`에 번역 정의
- `src/lib/stores/locale.ts`를 통한 언어 전환 및 localStorage 저장
- 컴포넌트에서 `$LL` store로 번역 문자열 접근

## 코드 작업 시 주의사항

### Svelte 5 Runes 사용
- `$state`, `$derived`, `$effect`를 사용하는 새로운 반응성 시스템
- `bind:this`로 컴포넌트 레퍼런스 바인딩
- `{#key}` 블록으로 탭 변경 시 컴포넌트 재마운트

### TypeScript 경로 별칭
- `$lib`: `src/lib` 디렉토리
- `$i18n`: `src/i18n` 디렉토리
- 절대 경로 import 사용 (예: `import { logger } from '$lib/logger'`)

### 탭 상태 업데이트
- 항상 `tabsStore` 메서드를 통해 상태 업데이트
- 직접 탭 객체를 수정하지 말고 `updateActiveTabContent`, `updateActiveTabRequestSettings` 등 사용
- localStorage 저장은 자동으로 debounce 적용 (1초)

### 그래프 레이아웃
- 노드 높이 변경 시 워커에 `measuredHeights` Map 전달
- `MAX_DISPLAY_ITEMS` (20개)를 초과하면 "show more" 버튼 표시
- 레이아웃 설정은 `src/lib/workers/graphLayout.worker.ts`의 `LayoutConfig` 참조

### Web Worker 통신
- 워커는 `postMessage`로 `{ type: 'layout', ... }` 전송
- 워커 응답: `{ type: 'progress' | 'done', ... }`
- 워커 파일은 Vite가 자동으로 번들링 (`?worker` suffix 사용)

### localStorage 키
- `src/lib/constants.ts`의 `STORAGE_KEYS`에 중앙 관리
- 탭 데이터: `pdjsoneditor_tabs`
- 언어: `language`

## 스타일링

- Tailwind CSS v4 사용
- `shadcn-svelte` UI 컴포넌트 (`src/lib/components/ui/`)
- `mode-watcher`로 다크/라이트 모드 토글
- CSS 변수 기반 테마 시스템 (`app.css`)

## 배포

- Docker 지원 (`Dockerfile`, `docker-compose.yml`)
- SvelteKit adapter-node 사용 (Node.js 서버)
- GitHub Container Registry에 이미지 자동 배포
- 프로덕션 포트: 3000

## 추가 정보

- 로그는 `$lib/logger.ts`의 `tslog` 사용 (개발 환경에서만 출력)
- Faker.js를 사용한 샘플 JSON 생성 (`$lib/utils/faker-generator.ts`)
- JSON 값 재생성 시 구조는 유지하고 값만 변경하는 로직 구현
