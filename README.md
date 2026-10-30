# SPATIA (스페이시아)

Spatial + Intelligence — 건물의 공간 관계와 점검·관리 기록을 연결합니다.

## 화면

- index.html: 로컬 XYZ 모델·공개 IFC 메시·AABB 관계·점검 순위·사례 검증
- gis.html: EPSG:3857/5186 원점·회전·축척·높이, OSM 지도·WGS84 GeoJSON
- management.html: 같은 건물·구조물·자재 데이터를 사용하는 로컬 역할 체험
- collaboration.html: Firebase UID·건물별 멤버십으로 공유 요청·담당 점검·승인 설명 관리
- shared-setup.html: 최초 시스템 관리자 등록과 검증 현황
- cloud.html: 개인 UID의 명시적 백업·복원
- guide.html: 1~5번 사용 가이드와 최신 PDF

## 실행과 검증

정적 HTML/CSS/JavaScript이므로 빌드 없이 dist를 게시합니다. 지도 라이브러리는 라이선스와 함께 배포본에 포함합니다. Firebase SDK는 공식 gstatic에서 로드합니다.

`npm ci` 후 `npm start`로 로컬 화면을 엽니다. `npm test`, `npm run test:ui`, `npm run test:management`, `npm run test:cloud`, `npm run test:platform`으로 검사합니다. 공식 Firebase CLI와 Java를 준비하고 `firebase emulators:start --only firestore,auth --project demo-spatia` 후 `npm run test:security`로 보안 규칙을 실행합니다. 포트는 firebase.json을 따릅니다.

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
