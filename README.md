# SPATIA (스페이시아)

**Spatial + Intelligence — 공간의 관계를 분석하고 지능적으로 관리하다.**

Geo-BIM·GIS 기반 실내 공간 관계 분석과 유지관리 연구용 웹 플랫폼입니다. 정적 HTML/CSS/JavaScript로 동작하며 Firebase Authentication과 Firestore 개인 백업 연결을 지원합니다.

## 화면
- index.html: 2D·3D 경계상자 모델, 공간 관계, 점검 우선순위
- management.html: 요청·시공·유지관리 및 입주자 역할 체험
- guide.html: Duplex 샘플 사용 방법
- cloud.html: Firebase 계정별 백업·복원

## 실행과 검증
Node.js가 있으면 npm start로 http://127.0.0.1:4173 을 엽니다. 별도 의존성 설치나 빌드가 필요하지 않습니다.

검증: npm test, npm run test:ui, npm run test:management, npm run test:cloud.

## Netlify 배포
게시 디렉터리는 **dist**, 빌드 명령은 비워 둡니다. netlify.toml에 경로가 지정되어 있습니다. 로컬 CLI 배포는 netlify deploy --prod --dir dist --no-build 로 실행합니다. 사용자 계정 Netlify 사이트에 연결하고 배포하세요. Git 연속 배포를 연결할 때도 main 브랜치와 dist 디렉터리를 선택합니다.

## Firebase
SPATIA 웹 앱 spatia-550fc 설정이 dist/firebase-config.js에 들어 있습니다. 웹 앱 식별 정보이며 서비스 계정 키를 포함하지 않습니다. 콘솔의 이메일/비밀번호 로그인, 기본 Firestore 데이터베이스 및 dist/firestore.rules 게시를 확인해야 합니다. Authentication의 승인된 도메인에 실제 Netlify 도메인을 추가합니다. 상세 설정·한계는 FIREBASE.md를 참고하세요.

저장 경로는 users/{uid}/snapshots/{model|operations}, 사용자별 최신 스냅샷입니다. 브라우저에서 저장 버튼을 눌러 서버가 확인한 경우에만 저장 완료로 표시합니다. 관리자·입주자 역할 전환은 실제 권한 분리 기능이 아닌 데모입니다.

## 데이터와 한계
기본 건물과 검사·하자 지표는 시연용 가정값입니다. Duplex JSON은 공개 IFC에서 선택한 구조물 50개·배관 연결 21개와 가상 하자 25건을 포함합니다. 메시 대신 보수적인 축정렬 경계상자(AABB)를 표시하며, 안전 등급·붕괴 확률 또는 원인 확정 결과가 아닙니다. NOTICE.md에 원본 출처와 변경 사항을 기록했습니다.

이 저장소에는 배포 인증 토큰, Netlify 소유권 등록 토큰, 원본 서비스 계정 키를 넣지 않습니다.
