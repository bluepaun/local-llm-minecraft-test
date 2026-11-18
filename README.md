# local-llm-minecraft-test

로컬로 돌린 LLM에 **단 하나의 프롬프트만** 던져서 만든 마인크래프트 클론 모음입니다.

> **Prompt (전 실험 공통, 단일):** `"make a minecraft clone as a single html"`

추가 지시(테라폼 개선, 텍스처 추가, 디버그 명령 등) 없이 이 문장 하나로만 생성된 결과물만 모았습니다.
다른 프롬프트로 만들어진 결과(마리오, GTA, FPS, 플라이트 시뮬레이터, 프랙탈 트리/ speedometer 등)는 이 저장소에서 제외했습니다.

- 🕹️ **Play (GitHub Pages):** https://bluepaun.github.io/local-llm-minecraft-test/
- 🖥️ **Hardware / 런타임:** AMD Ryzen AI Max+ 395 “Strix Halo” (128 GB unified memory) · llama.cpp
- 📦 원본 실험 폴더는 전혀 수정하지 않았고, 필요한 파일만 복사했습니다.

## 목록

| # | 원본 폴더 | 저장소 경로 | 파일 | 크기 |
|---|---|---|---|---|
| 001 | `test001-Nemotron-3-Super-120B-UD-Q4_K_XL` | `games/001-nemotron-3-super-120b-ud-q4-k-xl/index.html` | multi | 1.5 KB |
| 002 | `test002-gpt5.4` | `games/002-gpt5.4/index.html` | multi | 2.1 KB |
| 003 | `test003-OmniCoder-2-9B-Q8_0` | `games/003-omnicoder-2-9b-q8-0/index.html` | single | 15.6 KB |
| 004 | `test004-Qwen3-Coder_Next-UD-Q4_K_KL` | `games/004-qwen3-coder-next-ud-q4-k-kl/index.html` | single | 13.5 KB |
| 005 | `test005-Qwen3-Coder-Next-UD-Q8_K_XL` | `games/005-qwen3-coder-next-ud-q8-k-xl/index.html` | single | 14.4 KB |
| 006 | `test006-Qwen3.5-122B-A10B-UD-Q4_K_KL` | `games/006-qwen3.5-122b-a10b-ud-q4-k-kl/index.html` | single | 19.2 KB |
| 007 | `test007-Qwen3.5-122B-A10B-UD-Q4_K_KL-Coder` | `games/007-qwen3.5-122b-a10b-ud-q4-k-kl-coder/index.html` | single | 17.5 KB |
| 008 | `test008-Qwen3.5-27B-UD-Q8_K_XL` | `games/008-qwen3.5-27b-ud-q8-k-xl/index.html` | single | 28.2 KB |
| 010 | `test010-Gemma-4-31B-Q8_K_KL` | `games/010-gemma-4-31b-q8-k-kl/index.html` | single | 9.1 KB |
| 012 | `test012-MiniMax2.5-UD-Q3_K_XL` | `games/012-minimax2.5-ud-q3-k-xl/index.html` | single | 31.8 KB |
| 013 | `test013-supergemma` | `games/013-supergemma/index.html` | multi | 0.6 KB |
| 014 | `test014-Gemma-4-26B-A4B-Q8_K_KL` | `games/014-gemma-4-26b-a4b-q8-k-kl/index.html` | single | 7.0 KB |
| 015 | `test015-Qwen3.6-35B-BF16-Coder` | `games/015-qwen3.6-35b-bf16-coder/index.html` | single | 54.6 KB |
| 016 | `test016-Qwen3.6-35B-Q4_K_XL` | `games/016-qwen3.6-35b-q4-k-xl/index.html` | single | 18.4 KB |
| 017 | `test017-Qwen3.6-27B-Q8_K_XL` | `games/017-qwen3.6-27b-q8-k-xl/index.html` | single | 18.3 KB |
| 018 | `test018-qwen3.6_Q8_K_XL+parallel-thinking` | `games/018-qwen3.6-q8-k-xl-parallel-thinking/index.html` | single | 19.7 KB |
| 019 | `test019-MiniMax-M2.7-UD-IQ4_XS` | `games/019-minimax-m2.7-ud-iq4-xs/index.html` | single | 9.9 KB |
| 020 | `test020-20260506` | `games/020-20260506/index.html` | single | 24.3 KB |
| 021 | `test021-20260507` | `games/021-20260507/index.html` | single | 17.9 KB |
| 022 | `test022-OD` | `games/022-od/index.html` | single | 20.5 KB |
| 023 | `test023-OD` | `games/023-od-pi/index.html` | single | 24.2 KB |
| 024 | `test024-gemma` | `games/024-gemma/index.html` | single | 7.3 KB |
| 025 | `test025-minimax` | `games/025-minimax/index.html` | single | 19.3 KB |
| 026 | `test026-pi-agent` | `games/026-pi-agent-a/index.html` | single | 21.7 KB |
| 026 | `test026-pi-agent` | `games/026-pi-agent-b/index.html` | single | 36.0 KB |
| 027 | `test027-pi-qwen3.6-27b-mtp` | `games/027-pi-qwen3.6-27b-mtp/index.html` | single | 31.5 KB |
| 028 | `test028-Step-3.7-Flash-IQ4_XS` | `games/028-step-3.7-flash-iq4-xs/index.html` | single | 33.2 KB |
| 029 | `test029-Step-3.7-Flash-Q4_K_S` | `games/029-step-3.7-flash-q4-k-s/index.html` | single | 17.8 KB |
| 030 | `test030-step-proxy` | `games/030-step-proxy/index.html` | single | 20.6 KB |
| 031 | `test031-gpt-fable` | `games/031-gpt-fable/index.html` | single | 5.1 KB |
| 032 | `test032-laguna` | `games/032-laguna/index.html` | single | 18.1 KB |
| 033 | `test033-deepseek` | `games/033-deepseek/index.html` | single | 25.9 KB |
| 034 | `test034-deepseek` | `games/034-deepseek/index.html` | single | 25.0 KB |
| 035 | `test035-step` | `games/035-step/index.html` | single | 24.0 KB |
| 036 | `test036-deep` | `games/036-deep/index.html` | single | 26.7 KB |
| 037 | `test037-qwen3.8` | `games/037-qwen3.8/index.html` | single | 37.3 KB |
| 039 | `test039-ornith` | `games/039-ornith/index.html` | single | 18.5 KB |
| 040 | `test040-r9700-qwen38-q4` | `games/040-r9700-qwen38-q4/index.html` | single | 34.0 KB |
| 041 | `test041-qwen3.8-next-flash` | `games/041-qwen3.8-next-flash/index.html` | single | 19.1 KB |
| 042 | `test042-strata-iq3_s` | `games/042-strata-iq3-s/index.html` | single | 71.2 KB |
| 044 | `test044-helogen` | `games/044-helogen/index.html` | single | 56.8 KB |

### 이 저장지에서 빠진 원본 폴더

- `test009-Nemotron-Cascade-2-30B-Q6_K_L` — 빈 폴더 (출력 없음)
- `test011-Qwen3.5-397B-UD-IQ1_M-Coder` — 빈 폴더 (출력 없음)
- `test038-multi` — 마리오/히어로 아레나 등 다른 프롬프트 결과만 있음
- `test043-strata-iq4_xs` — 빈 폴더 (출력 없음)

### 같은 폴더에 있었지만 포함하지 않은 변형

- test010-Gemma-4-31B-Q8_K_KL/minecraft_game/index.html — style.css/game.js 참조가 깨져서 제외
- test018-qwen3.6_Q8_K_XL+parallel-thinking/backup-fold|backup2|backup3 — 백업 사본, 메인본만 포함
- test023-OD/index.html(838B 스텁), test023-OD/pi/minecraft2.html — 사본으로 제외
- test034-deepseek/minecraft-clone-2d.html — 2D 변형(별도 후속 프롬프트)
- test037-qwen3.8/index, index copy.html, flight/flight-sim.html — 중복/다른 프롬프트
- test038-multi/*, test040의 gta|mario|fps, test041의 fps|mario, test026-pi-agent의 eye|tree|seasons|speed — 다른 프롬프트 결과

## 구조

```
index.html          # 게임 목록 (카드 클릭 → 새 탭에서 실행)
games/<NNN>-<model-slug>/index.html   # 실험별 한 개의 게임
tools/build.py      # 원본 → games/ 복사 (원본은 읽기만)
tools/make_site.py  # index.html / README.md 생성
games.json          # 목록 데이터
```

경로 규칙: `NNN`은 원래 실험 번호(`testNNN-...`), 나머지는 모델명/양자화 태그를 정리한 slug입니다.
원본 `minecraft.html`, `index.html`, `minecraft_clone.html`, `voxelcraft.html` 등은 전부 `games/.../index.html`로 통일했습니다.

## 재빌드

```bash
python3 tools/build.py      # 원본 폴더에서 복사 (SRC 상수로 원본 경로 지정)
python3 tools/make_site.py  # index.html / README.md 재생성
```

## 참고

- 대부분의 게임은 순수 Canvas/WebGL 인라인 구현이지만, 일부는 three.js를 CDN(cdnjs / unpkg / jsdelivr)에서 불러옵니다. 오프라인이면 그 항목만 로드 실패합니다.
- 조작 체계는 모델이 제각각입니다. 대개 화면 클릭 → 포인터 잠금, WASD + Space, 좌클릭 파괴 / 우클릭 설치.
- 원본에는 스크린샷·로그·프롬프트 트랜스크립트가 더 있지만, 페이지 정적 호스팅 용도라 게임 파일만 올렸습니다.
