# Firebase 저장·권한과 확인 결과

## 운영 상태

2026-10-31: spatia-550fc의 Firestore API를 활성화하고 기본 Standard 데이터베이스를 서울(asia-northeast3)에 생성했습니다. 이메일/비밀번호 인증을 확인했으며 super-concha-6f6fb1.netlify.app 및 roaring-maamoul-d1bbf1.netlify.app을 승인 도메인에 연결했습니다. 기존 승인 도메인을 보존했습니다. dist/firestore.rules와 firestore.indexes.json을 운영에 배포했습니다.

운영 Firebase Auth/Firestore 임시 계정으로 20개 검사를 통과했습니다. 개인 백업 저장·다른 UID 차단, 공동 요청 저장·다른 세대 차단, 담당자 배정, 전문가 원문 비공개, 관리자 승인 설명, 다른 계정의 실시간 상태 수신을 확인했습니다. 임시 계정·격리 QA 문서는 삭제했습니다. 에뮬레이터에서 추가 경계 사례 포함 29개 검사를 통과했습니다. qa/ 결과를 참조하세요. 이 결과는 현장 정확도·안전·법규 인증이 아닙니다.

## 최초 사람 계정의 권한 등록

1. cloud.html에서 본인의 SPATIA 계정을 만든 뒤 collaboration.html에 로그인합니다.
2. 화면의 UID를 확인합니다. 프로젝트 소유자가 신원을 확인한 뒤 Firebase 콘솔 Firestore의 systemAdmins/{UID} 문서를 등록합니다. 예: enabled=true. 현재 규칙은 이 문서의 enabled=true로 시스템 관리자를 판별합니다. 웹 클라이언트는 이 컬렉션에 쓸 수 없습니다.
3. 공동 관리에서 건물 ID를 열고 현재 모델 구조물을 등록합니다.
4. 시스템 관리자는 담당자 UID·역할(resident/manager/expert)·units(최대 20개)를 등록합니다. 실제 사람에게 임의로 권한을 부여하지 않았습니다.

## 서버 경계

- users/{uid}/snapshots/{model|operations}: 본인 UID의 최신 개인 스냅샷. 명시적 저장·복원, UTF-8 800,000 bytes 이하.
- buildings/{id}/members/{uid}: 시스템 관리자만 역할·세대 등록. 자기 승격 거부.
- elements/{elementId}: 관리자 등록, 세대별 입주자 조회 제한.
- requests/{requestId}: 본인 요청 등록·조회, 담당 건물 관리자 처리, 배정된 전문가 조회. 단계·일정·불변 필드 검증.
- inspections/{inspectionId}: 담당 전문가 작성 원문. 관리자/작성 전문가만 조회.
- publicUpdates/{inspectionId}: 관리자만 검토된 내용·개정과 일치하는 설명을 승인. raw 필드는 허용하지 않음. 입주자는 본인 세대·공용부만 조회.

클라이언트가 역할이나 쿼리를 변조해도 Firestore 서버 규칙이 검사합니다. Admin SDK를 사용하는 별도 서버를 추가하면 이 규칙을 우회하므로 같은 권한을 서버에서도 검증해야 합니다. 현재 별도 Admin SDK 업무 서버는 없습니다.

공동 관리의 실제 업무 기록을 로컬 데모나 개인 스냅샷으로 자동 복사하지 않습니다. 역할 체험은 가상 자료이며 실제 직무 인증이 아닙니다. 로그인 실패·권한 거부 시 로컬로 저장해 성공했다고 표시하지 않습니다.

## 검증 실행

공식 Firebase Emulator Suite를 demo-spatia 프로젝트로 실행하고 npm run test:security를 실행합니다. verify-production.mjs는 명시적으로 실행할 때만 운영에 격리된 임시 계정·기록을 만들고 정리합니다. 프로젝트 소유자 CLI 권한이 필요하며 토큰은 메모리에서만 사용합니다. 일반 npm test에는 운영 쓰기를 포함하지 않습니다.

공식 문서: https://firebase.google.com/docs/firestore/security/get-started , https://firebase.google.com/docs/rules/unit-tests , https://firebase.google.com/docs/auth/web/password-auth

운영 소유자가 제공한 UID를 확인해 시스템 관리자(enabled=true)로 등록했으며 기본 forest-a-demo 모델의 구조물 84개를 서버에 준비했습니다. UID는 공개 저장소에 기록하지 않습니다. 입주자·전문가 역할은 실제 담당자의 신원 확인 후 등록합니다.
