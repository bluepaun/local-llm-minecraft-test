# local-llm-minecraft-test

> **Prompt:** `"make a minecraft clone as a single html"`

- 🕹️ **Play:** https://bluepaun.github.io/local-llm-minecraft-test/
- 🖥️ **HW:** AMD Ryzen AI Max+ 395 “Strix Halo” (128 GB unified memory) · llama.cpp

모든 결과물은 **모델의 원샷(one-shot) 생성 수준**을 확인하기 위해 위 프롬프트를 **딱 한 번**만 적용해서 얻었습니다.
후속 지시·수정·디버깅을 전혀 하지 않았기 때문에 **일부 파일은 실행에 실패할 수 있습니다.**
상태 열은 headless Chrome으로 각 페이지를 실제로 띄워 렌더 루프 동작·catch되지 않은 오류를 자동 확인한 결과이며,
플레이 품질까지 검증한 것은 아닙니다.

| # | 게임 | 파일 | 실행 상태 | 크기 |
|---|---|---|---|---|
| 001 | `001-nemotron-3-super-120b-ud-q4-k-xl` | multi | ✅ 실행 확인 | 1.5 KB |
| 002 | `002-gpt5.4` | multi | ✅ 실행 확인 | 2.1 KB |
| 003 | `003-omnicoder-2-9b-q8-0` | single | ✅ 실행 확인 | 15.6 KB |
| 004 | `004-qwen3-coder-next-ud-q4-k-kl` | single | ⛔ 실행 실패 — Uncaught TypeError: THREE.PointerLockControls is not a constructor | 13.5 KB |
| 005 | `005-qwen3-coder-next-ud-q8-k-xl` | single | ✅ 실행 확인 | 14.4 KB |
| 006 | `006-qwen3.5-122b-a10b-ud-q4-k-kl` | single | ⛔ 실행 실패 — 매 프레임 오류: Uncaught ReferenceError: Cannot access 'lastTime' before initialization | 19.2 KB |
| 007 | `007-qwen3.5-122b-a10b-ud-q4-k-kl-coder` | single | ✅ 실행 확인 | 17.5 KB |
| 008 | `008-qwen3.5-27b-ud-q8-k-xl` | single | ✅ 실행 확인 | 28.2 KB |
| 010 | `010-gemma-4-31b-q8-k-kl` | single | ✅ 실행 확인 | 9.1 KB |
| 012 | `012-minimax2.5-ud-q3-k-xl` | single | ✅ 실행 확인 | 31.8 KB |
| 013 | `013-supergemma` | multi | ✅ 실행 확인 | 0.6 KB |
| 014 | `014-gemma-4-26b-a4b-q8-k-kl` | single | ✅ 실행 확인 | 7.0 KB |
| 015 | `015-qwen3.6-35b-bf16-coder` | single | ✅ 실행 확인 | 54.6 KB |
| 016 | `016-qwen3.6-35b-q4-k-xl` | single | ✅ 실행 확인 | 18.4 KB |
| 017 | `017-qwen3.6-27b-q8-k-xl` | single | ✅ 실행 확인 | 18.3 KB |
| 018 | `018-qwen3.6-q8-k-xl-parallel-thinking` | single | ✅ 실행 확인 | 19.7 KB |
| 019 | `019-minimax-m2.7-ud-iq4-xs` | single | ⚠️ 부분 동작 — Uncaught TypeError: this.renderer.requestPointerLock is not a function | 9.9 KB |
| 020 | `020-20260506` | single | ⛔ 실행 실패 — Uncaught ReferenceError: ty is not defined | 24.3 KB |
| 021 | `021-20260507` | single | ✅ 실행 확인 | 17.9 KB |
| 022 | `022-od` | single | ⛔ 실행 실패 — Uncaught TypeError: colors is not iterable | 20.5 KB |
| 023 | `023-od-pi` | single | ⛔ 실행 실패 — Uncaught SyntaxError: Illegal break statement | 24.2 KB |
| 024 | `024-gemma` | single | ✅ 실행 확인 | 7.3 KB |
| 025 | `025-minimax` | single | ✅ 실행 확인 | 19.3 KB |
| 026 | `026-pi-agent-a` | single | ✅ 실행 확인 | 21.7 KB |
| 026 | `026-pi-agent-b` | single | ✅ 실행 확인 | 36.0 KB |
| 027 | `027-pi-qwen3.6-27b-mtp` | single | ⛔ 실행 실패 — Uncaught ReferenceError: mergeBlockPositions is not defined | 31.5 KB |
| 028 | `028-step-3.7-flash-iq4-xs` | single | ✅ 실행 확인 | 33.2 KB |
| 029 | `029-step-3.7-flash-q4-k-s` | single | ⚠️ 부분 동작 — Uncaught ReferenceError: blockGeom is not defined | 17.8 KB |
| 030 | `030-step-proxy` | single | ✅ 실행 확인 | 20.6 KB |
| 031 | `031-gpt-fable` | single | ⛔ 실행 실패 — Uncaught TypeError: Failed to resolve module specifier "three". Relative references must start with either "/" | 5.1 KB |
| 032 | `032-laguna` | single | ✅ 실행 확인 | 18.1 KB |
| 033 | `033-deepseek` | single | ✅ 실행 확인 | 25.9 KB |
| 034 | `034-deepseek` | single | ✅ 실행 확인 | 25.0 KB |
| 035 | `035-step` | single | ✅ 실행 확인 | 24.0 KB |
| 036 | `036-deep` | single | ✅ 실행 확인 | 26.7 KB |
| 037 | `037-qwen3.8` | single | ✅ 실행 확인 | 37.3 KB |
| 039 | `039-ornith` | single | ✅ 실행 확인 | 18.5 KB |
| 040 | `040-r9700-qwen38-q4` | single | ✅ 실행 확인 | 34.0 KB |
| 041 | `041-qwen3.8-next-flash` | single | ✅ 실행 확인 | 19.1 KB |
| 042 | `042-strata-iq3-s` | single | ✅ 실행 확인 | 71.2 KB |
| 044 | `044-helogen` | single | ✅ 실행 확인 | 56.8 KB |

- ✅ 실행 확인: canvas가 생성되고 렌더 루프(rAF/timer)가 도는 것을 확인
- ⛔ 실행 실패: 로드/실행 시 오류로 화면이 그려지지 않거나 루프가 돌지 않음 (원인 표기)
- ⚠️ 부분 동작: 화면은 뜨지만 조작 시 오류 등 문제

### 모델명 참고 (`strata` / `helogen`)

`test041` · `test042` · `test044`는 전부 같은 모델 **[Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)**(125B MoE)이고, 뒤에 붙은 이름은 모델이 아니라 실행에 쓴 스택/엔진입니다.

| 태그 | 정체 |
|---|---|
| `IQ3_S` (Strata) | [strata-nvfp4](https://github.com/sergqwer/strata-nvfp4) 서빙 스택(전문가 가중치를 RAM에 올리는 NVFP4 계열)로 띄운 **IQ3_S** 퀀트 |
| `Halogen` | [halogen-flash-server](https://github.com/peonist-ai/halogen-flash-server) — AMD Strix Halo(gfx1151/ROCm) 최적화 로컬 추론 엔진. `.hgn` 4-bit 웨이트 ([peonist-ai/halogen-qwen3.8-flash-next](https://huggingface.co/peonist-ai/halogen-qwen3.8-flash-next)) |
