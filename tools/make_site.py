#!/usr/bin/env python3
"""Generate index.html (game list) and README.md from games.json."""
import json, os, html

DST = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import SKIPPED, VARIANTS

REPO = "https://github.com/bluepaun/local-llm-minecraft-test"
PAGES = "https://bluepaun.github.io/local-llm-minecraft-test/"
PROMPT = "make a minecraft clone as a single html"
HW = "AMD Ryzen AI Max+ 395 “Strix Halo” (128 GB unified memory) · llama.cpp"

es = json.load(open(os.path.join(DST, "games.json")))

PAGE = """<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Local LLM Minecraft Lab — 마인크래프트 클론 플레이 목록</title>
<meta name="description" content="로컬 LLM이 'make a minecraft clone as a single html' 하나의 프롬프트로 만든 마인크래프트 클론 모음. AMD Strix Halo 128GB + llama.cpp.">
<style>
  :root{--bg:#14161a;--panel:#1c1f25;--edge:#2b3038;--ink:#e8eaed;--dim:#9aa3ad;--acc:#6cc24a;--acc2:#4a9e2f;--warn:#e0a33c}
  *{box-sizing:border-box}
  html,body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 ui-monospace,SFMono-Regular,Menlo,"D2Coding","Courier New",monospace}
  a{color:inherit;text-decoration:none}
  .wrap{max-width:1180px;margin:0 auto;padding:28px 20px 72px}
  header h1{margin:0 0 6px;font-size:26px;letter-spacing:.02em}
  header h1 b{color:var(--acc)}
  .prompt{display:inline-block;margin:10px 0 4px;padding:7px 12px;border:1px solid var(--edge);border-left:3px solid var(--acc);background:var(--panel);border-radius:4px;font-size:14px}
  .prompt code{color:var(--acc)}
  .hw{color:var(--dim);font-size:13px;margin:4px 0 0}
  .bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:22px 0 14px}
  input#q{flex:1;min-width:220px;padding:10px 12px;background:var(--panel);border:1px solid var(--edge);border-radius:4px;color:var(--ink);font:inherit}
  input#q:focus{outline:none;border-color:var(--acc)}
  .cnt{color:var(--dim);font-size:13px;white-space:nowrap}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(268px,1fr));gap:12px}
  .card{display:flex;flex-direction:column;gap:6px;padding:14px;background:var(--panel);border:1px solid var(--edge);border-radius:6px;transition:.14s}
  .card:hover{border-color:var(--acc);transform:translateY(-2px);box-shadow:0 6px 18px #0006}
  .top{display:flex;align-items:baseline;gap:8px}
  .num{font-size:12px;color:var(--bg);background:var(--acc);border-radius:3px;padding:2px 6px;font-weight:700}
  .name{font-weight:700;font-size:15px;word-break:break-word}
  .t{color:var(--dim);font-size:13px;word-break:break-word}
  .meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px}
  .tag{font-size:11px;padding:2px 7px;border:1px solid var(--edge);border-radius:999px;color:var(--dim)}
  .tag.ok{color:var(--acc);border-color:#33502c}
  .tag.warn{color:var(--warn);border-color:#5a4620}
  .play{margin-top:8px;font-size:12px;color:var(--acc)}
  section.note{margin-top:34px;color:var(--dim);font-size:13px}
  section.note h2{font-size:14px;color:var(--ink);margin:0 0 8px}
  section.note ul{margin:0;padding-left:18px}
  .hint{margin-top:26px;padding:12px 14px;border:1px dashed var(--edge);border-radius:6px;color:var(--dim);font-size:13px}
</style>
</head>
<body>
<div class="wrap">
<header>
  <h1>Local LLM <b>Minecraft</b> Lab</h1>
  <div>로컬 LLM이 브라우저 게임 하나를 만들어냈는지 비교하는 실험실. 카드를 누르면 새 탭에서 바로 플레이됩니다.</div>
  <div class="prompt">Prompt (단일) &rarr; <code>"__PROMPT__"</code></div>
  <p class="hw">HW: __HW__ &nbsp;·&nbsp; <a href="__REPO__" style="color:var(--acc)">GitHub</a> &nbsp;·&nbsp; 원본 폴더는 수정하지 않고 복사만 했습니다.</p>
</header>

<div class="bar">
  <input id="q" placeholder="filter — model / quant / title (예: qwen, gemma, q4, single)" autocomplete="off">
  <span class="cnt" id="cnt"></span>
</div>

<main class="grid" id="grid"></main>

<div class="hint">플레이 팁: 카드를 클릭하면 새 탭에 열립니다. 화면을 클릭하면 마우스가 잠기고(WASD 이동 / Space 점프 / 좌클릭 파괴 · 우클릭 설치 / 1-9 블록 선택), Esc로 잠금 해제됩니다. 일부 제목은 three.js를 CDN에서 받으니 첫 실행 시 네트워크가 필요합니다.</div>

<section class="note">
  <h2>이 목록에서 빠진 것</h2>
  <ul>__SKIPPED__</ul>
  <h2 style="margin-top:18px">동일 폴더의 미포함 변형</h2>
  <ul>__VARIANTS__</ul>
</section>
</div>

<script>
const G = __DATA__;
const grid = document.getElementById('grid'), q = document.getElementById('q'), cnt = document.getElementById('cnt');
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function render(f){
  f=(f||'').toLowerCase();
  const list = G.filter(g=>!f || (g.num+' '+g.label+' '+g.title+' '+(g.single?'single':'multi')+' '+(g.cdn?'three.js cdn':'inline')).toLowerCase().includes(f));
  cnt.textContent = list.length + ' / ' + G.length + ' games';
  grid.innerHTML = list.map(g=>`<a class="card" href="${g.path}" target="_blank" rel="noopener">
    <div class="top"><span class="num">${g.num}</span><span class="name">${esc(g.label)}</span></div>
    <div class="t">${esc(g.title)}</div>
    <div class="meta">
      <span class="tag ${g.single?'ok':''}">${g.single?'single file':'multi file'}</span>
      ${g.cdn?'<span class="tag warn">three.js CDN</span>':'<span class="tag">no CDN</span>'}
      <span class="tag">${(g.size/1024).toFixed(1)} KB</span>
      <span class="tag">${g.date}</span>
    </div>
    <div class="play">▶ 새 탭에서 실행</div></a>`).join('');
}
q.addEventListener('input',e=>render(e.target.value));
render('');
</script>
</body>
</html>
"""

skipped = "\n".join(f"  <li><code>{html.escape(k)}</code> — {html.escape(v)}</li>" for k, v in SKIPPED.items())
variants = "\n".join(f"  <li>{html.escape(v)}</li>" for v in VARIANTS)

out = (PAGE.replace("__DATA__", json.dumps(es, ensure_ascii=False))
           .replace("__PROMPT__", html.escape(PROMPT))
           .replace("__HW__", html.escape(HW))
           .replace("__REPO__", REPO)
           .replace("__SKIPPED__", skipped)
           .replace("__VARIANTS__", variants))
open(os.path.join(DST, "index.html"), "w", encoding="utf-8").write(out)

# ---------------- README ----------------
rows = "\n".join(
    f"| {e['num']} | `{e['orig']}` | `{e['path']}` | {'single' if e['single'] else 'multi'} | {e['size']/1024:.1f} KB |"
    for e in es)

readme = f"""# local-llm-minecraft-test

로컬로 돌린 LLM에 **단 하나의 프롬프트만** 던져서 만든 마인크래프트 클론 모음입니다.

> **Prompt (전 실험 공통, 단일):** `"{PROMPT}"`

추가 지시(테라폼 개선, 텍스처 추가, 디버그 명령 등) 없이 이 문장 하나로만 생성된 결과물만 모았습니다.
다른 프롬프트로 만들어진 결과(마리오, GTA, FPS, 플라이트 시뮬레이터, 프랙탈 트리/ speedometer 등)는 이 저장소에서 제외했습니다.

- 🕹️ **Play (GitHub Pages):** {PAGES}
- 🖥️ **Hardware / 런타임:** {HW}
- 📦 원본 실험 폴더는 전혀 수정하지 않았고, 필요한 파일만 복사했습니다.

## 목록

| # | 원본 폴더 | 저장소 경로 | 파일 | 크기 |
|---|---|---|---|---|
{rows}

### 이 저장지에서 빠진 원본 폴더

""" + "\n".join(f"- `{k}` — {v}" for k, v in SKIPPED.items()) + """

### 같은 폴더에 있었지만 포함하지 않은 변형

""" + "\n".join(f"- {v}" for v in VARIANTS) + """

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
"""
open(os.path.join(DST, "README.md"), "w", encoding="utf-8").write(readme)
print("wrote index.html, README.md")
