# SPATIA (스페이시아)

Spatial + Intelligence — 건물의 공간 관계와 점검·관리 기록을 연결합니다.

## 화면

- index.html: 소개 전용 랜딩·스크롤 건물 모션
- login.html: Firebase 계정 생성·로그인·로그아웃
- workspace.html: 로컬 XYZ 모델·공개 IFC 메시·AABB 관계·점검 순위·사례 검증
- gis.html: EPSG:3857/5186 원점·회전·축척·높이, OSM 지도·WGS84 GeoJSON
- management.html: 같은 건물·구조물·자재 데이터를 사용하는 로컬 역할 체험
- guide.html: 1~5번 사용 가이드와 최신 PDF

## 실행과 검증

로그아웃 상태에서 공동 관리로 이동하면 ‘로그인 후에 이용가능 합니다’ 안내 모달을 표시합니다. ‘로그인하기’는 로그인 폼으로 이동하고 이메일 입력란에 포커스를 둡니다. 취소·닫기·Esc는 현재 화면을 유지합니다. 로그인 복원이 끝난 후 이동 여부를 판단하며, 명시적인 로그인 링크는 모달을 거치지 않습니다.

메인 스크롤 건물은 창틀·발코니·난간·출입구·옥상 태양광·조경과 가구를 포함합니다. 옥상과 외피는 실내 진입 시 사라지며, 정적 SVG도 같은 3D 형상에서 생성합니다(`node qa/generate-building-fallback.cjs`). 공간 분석의 ‘외관 세부’는 가상 기본 모델에만 적용하는 시각화 레이어입니다. 원본 구조물 ID·좌표·점검 지표와 IFC 메시를 수정하거나 별도 점검 객체를 추가하지 않습니다. `npm run test:building`으로 표시 형상과 분석 결과 보존을 검사합니다.

상단 계정 링크는 Firebase Auth가 확인한 로그인 상태에 따라 ‘로그인’ 또는 ‘내 워크스페이스’로 바뀝니다. 로그아웃하면 다시 ‘로그인’으로 돌아갑니다. 내장 업무 화면의 상태 변경도 같은 출처의 등록된 iframe에서만 반영하며, 링크 표시는 건물 권한을 부여하지 않습니다. 실제 접근 제어는 기존 Firestore 규칙이 담당합니다. `npm run test:auth-header`는 실제 계정에 로그인하지 않고 인증 콜백과 메시지 검증을 검사합니다.

전체 화면의 공통 글꼴은 Pretendard Variable v1.3.9입니다. 공식 [Pretendard 저장소](https://github.com/orioncactus/pretendard)의 WOFF2를 `dist/fonts/`에서 직접 제공하며, SIL Open Font License 원문도 함께 포함합니다. `ui-system.css`에서 가변 굵기와 `font-display: swap`을 설정하고, 각 페이지에서 같은 파일을 미리 불러옵니다.

메인 색상은 딥 그린(#133215)과 화이트(#FFFFFF)이며, 라이트 그린(#81C784)을 선택 메뉴·버튼·가상 건물의 강조색으로 사용합니다. 공통 색상은 `dist/site-palette.css`에서 관리하며, 화이트 카드·입력창·안내 영역에 짙은 그린 글씨를 사용합니다. 구분선과 보조 배경도 같은 그린의 투명도로 표현합니다. 첫 화면은 hero-building.json을 한 번 비동기로 읽고, Canvas에서 3D 면과 카메라를 갱신합니다. 아래로 스크롤하면 외관 회전 → 확대 → 가상 302호 내부 진입으로 이어지고 위로 스크롤하면 되돌아갑니다. 실제 BIM 탐색·현장 데이터는 아래 분석 워크스페이스에서 사용합니다. 모션은 가상 건물 콘셉트이며, 운영체제의 모션 감소 설정에서는 정적 외관과 바로가기만 제공합니다. `npm run test:journey`는 카메라 경로·실내 도착·근접 면 클리핑을 확인합니다.

홈(index.html)은 소개 전용 랜딩이며 분석 스크립트를 불러오지 않습니다. 기능 진입점은 workspace.html입니다. 기능 화면 사이에서는 공통 헤더·해시 라우터와 지연 로딩 iframe을 유지해 작성 중인 폼과 뒤로 가기를 지원합니다. 홈으로 이동하면 별도 문서로 전환합니다. 개인 백업 페이지는 제거했으며 공동 관리 페이지도 제거했습니다. 계정 생성·로그인은 독립된 login.html에서 제공하고, 역할별 업무는 브라우저의 로컬 체험입니다. `node verify-spa.cjs`와 `node verify-page-boundaries.cjs`로 경로와 페이지 분리를 확인합니다.

정적 HTML/CSS/JavaScript이므로 빌드 없이 dist를 게시합니다. 지도 라이브러리는 라이선스와 함께 배포본에 포함합니다. Firebase SDK는 공식 gstatic에서 로드합니다.

`npm ci` 후 `npm start`로 로컬 화면을 엽니다. `npm test`, `npm run test:ui`, `npm run test:management`, `npm run test:platform`으로 검사합니다. 공식 Firebase CLI와 Java를 준비하고 `firebase emulators:start --only firestore,auth --project demo-spatia` 후 `npm run test:security`로 보안 규칙을 실행합니다. 포트는 firebase.json을 따릅니다.

## 실제 Firebase

spatia-550fc / 기본 Standard Firestore / asia-northeast3. 보안 규칙은 dist/firestore.rules이며 개인 백업 소유권과 공동 관리 권한을 함께 검증합니다. 2026-10-31 운영 서버에서 임시 계정 20개 흐름 검사, 에뮬레이터에서 29개 검사를 수행했습니다. 임시 QA 자료는 정리했습니다. 검사 결과는 qa/ 및 dist/verification-status.json에 있습니다.

프로젝트 소유자가 신원을 확인한 실제 계정의 UID를 systemAdmins/{uid} 문서로 최초 등록해야 합니다. 이후 시스템 관리자가 건물 멤버십을 부여합니다. 상세 설정은 FIREBASE.md와 shared-setup.html을 따르세요. 역할 체험 버튼으로 실제 권한을 부여하지 않습니다.

## 데이터·검증 한계

공개 Duplex의 50개 객체는 실제 IFC 삼각형 메시·층·자재·포트 연결을 추출했으며 Q/M/E와 결함 25건은 가상입니다. 모델 JSON은 건물 ID와 지도 기준을 보존합니다. 관계 계산은 AABB이며 정밀 메시 충돌이 아닙니다. 외부 GeoJSON은 경계상자 중첩 후보만 비교합니다. IfcSite 위치와 사용자 입력 좌표는 측량 검증이 아닙니다.

검토 사례 JSON을 불러와 같은 검토 범위에서 Precision/Recall을 계산할 수 있지만 실제 현장 정답은 확보되지 않았습니다. AI·기상/DEM/침수 API·직무 자격 인증·완전한 변경 감사 로그는 향후 범위입니다. NOTICE.md와 기능명세서 PDF에 출처와 한계를 기록합니다.

## 배포

Netlify의 게시 디렉터리는 dist, 빌드는 필요 없습니다. main은 GitHub 연결 운영 사이트에 자동 배포됩니다. Firebase 보안 규칙 변경은 에뮬레이터 확인 후 `firebase deploy --only firestore:rules,firestore:indexes --project spatia-550fc`로 별도 배포합니다. 다른 서비스의 규칙과 병합해야 하는 프로젝트라면 무조건 교체하지 마세요.

인증 토큰·서비스 계정 키·비밀번호는 저장소와 배포본에 포함하지 않습니다.

운영 소유자가 제공한 UID를 확인해 시스템 관리자(enabled=true)로 등록했으며 기본 forest-a-demo 모델의 구조물 84개를 서버에 준비했습니다. UID는 공개 저장소에 기록하지 않습니다. 입주자·전문가 역할은 실제 담당자의 신원 확인 후 등록합니다.
