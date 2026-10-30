# Firebase 연결과 검증

`dist/cloud.html`은 Firebase Web SDK 13.1.0의 Authentication(이메일/비밀번호)과 Cloud Firestore로 개인 백업을 제공합니다. 소유자가 제공한 SPATIA 프로젝트 `spatia-550fc` 웹 앱 설정을 기본 등록했습니다. 연결 화면을 열면 SDK를 초기화합니다. 실제 계정 로그인·저장 및 보안 규칙 실행은 별도 확인이 필요합니다. 웹 앱 설정은 연결 화면에서 입력하며, 선택한 경우에만 해당 브라우저에 기억합니다. 계정 비밀번호는 저장하거나 로그에 남기지 않습니다.

## 사용자 설정

1. https://console.firebase.google.com/ 에서 프로젝트와 웹 앱을 등록합니다. Firebase Hosting은 이 Sites 주소를 대신하지 않습니다.
2. 이메일/비밀번호 Authentication을 활성화하고 이 사이트 도메인을 승인된 도메인에 추가합니다.
3. 기본 `(default)` Firestore 데이터베이스를 프로덕션 모드로 생성합니다. 실제 사용할 지역·리전을 선택합니다.
4. `dist/firestore.rules`를 콘솔의 규칙 편집기에 게시합니다. 기존 프로젝트의 다른 앱이 있으면 규칙을 무조건 교체하지 말고 병합하세요.
5. 웹 앱 `firebaseConfig`를 사이트의 Firebase 연결 화면에 입력합니다. 서비스 계정 키는 브라우저나 채팅으로 보내지 않습니다.
6. 연결 화면에서 백업 계정을 생성하거나 로그인하고, '현재 모델 저장' → '백업 확인' → 다른 브라우저에서 동일 프로젝트·동일 계정으로 '모델 불러오기'를 확인합니다.

CLI가 있는 개발 환경에서는 이 디렉터리에서 `firebase deploy --only firestore:rules,firestore:indexes --project 실제프로젝트ID`로 준비된 규칙과 payload 인덱스 제외 설정을 배포할 수 있습니다. 실제 프로젝트ID는 아직 지정하지 않았습니다.

## 저장 규약

- `users/{uid}/snapshots/model` 및 `operations`, 종류별 최신 스냅샷 1개
- 문서 필드: schemaVersion=1, kind, payload(JSON 문자열), provenance, updatedAt(서버 시각)
- 각 백업은 UTF-8 800,000 bytes 이하. IFC 원본·대용량 사진은 파일 저장소 확장 전까지 별도 JSON/파일로 보관
- 저장·불러오기는 사용자 클릭으로 수행. 원격 성공 응답 후 저장 완료 표시
- 불러올 데이터는 형식 검증 및 교체 확인 후 localStorage에 반영
- Firestore 규칙은 본인 UID 경로만 허용하고 목록 조회는 금지. 유지관리 데모의 역할 선택은 Firebase 권한과 무관
- 이 연결은 개인 백업용. 여러 직원의 공동 편집·관리자 권한·입주자 세대별 권한·실제 업무 알림은 별도 구현 필요

## 확인한 범위

2026-10-30: 제공된 웹 앱 설정으로 Firebase Auth 공개 프로젝트 설정을 조회해 HTTP 200 응답과 프로젝트 번호 169709493162를 확인했습니다. 당시 승인된 도메인은 localhost, spatia-550fc.firebaseapp.com, spatia-550fc.web.app이며 Sites 도메인은 빠져 있었습니다. 공개 응답은 이메일/비밀번호 사용 설정 여부를 제공하지 않았습니다. 계정 로그인·Firestore 쓰기는 사용자 로그인 후 확인해야 합니다. 이 조회로 콘솔의 보안 규칙을 게시하거나 수정하지 않았습니다.

`node verify-cloud.cjs`: 설정·원본 비밀키 입력 거부, UTF-8 크기 한도, 모델/관리 이력 스키마, UID 경로 분리, 모의 서버 저장 성공·거부 처리, 복원 검증과 손상 데이터로 인한 로컬 덮어쓰기 방지.

실제 Firebase 프로젝트가 준비되면 인증·쓰기·다른 계정 접근 거부를 원격 또는 Emulator Suite에서 확인해야 합니다. 모의 테스트는 실제 보안 규칙의 실행 검증을 대신하지 않습니다.

공식 근거(2026-10-30 확인):
- https://firebase.google.com/docs/web/setup
- https://firebase.google.com/docs/auth/web/password-auth
- https://firebase.google.com/docs/firestore/security/get-started
- https://firebase.google.com/docs/firestore/quotas
