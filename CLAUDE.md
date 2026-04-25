@AGENTS.md

# 개발 워크플로우

이 프로젝트는 `yha992/vibe-bluebird`(upstream, 원본)를 fork한 `KIMSG/vibe-bluebird`(origin, 본인 fork)에서 작업합니다.

## 개발 시작 전 (항상)
- 작업을 시작하기 전에 반드시 `git pull upstream main`을 실행해 `yha992/vibe-bluebird`의 최신 변경사항을 먼저 받아옵니다.
- 충돌이 발생하면 사용자에게 알리고 해결 방법을 협의한 뒤 계속 진행합니다.

## 개발 종료 후 (항상)
- 작업이 끝나면 양쪽 레포에 모두 푸시해서 머지가 반영되도록 합니다:
  1. `git push origin main` — 본인 fork(KIMSG)에 푸시
  2. `git push upstream main` — 원본(yha992)에 푸시
- 한쪽이라도 푸시에 실패하면 즉시 사용자에게 보고합니다.
