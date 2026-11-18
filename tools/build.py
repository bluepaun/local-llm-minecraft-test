#!/usr/bin/env python3
"""Build the public "local-llm-minecraft-test" Pages site from the original test folders.

Originals are never modified: everything is copied into games/<entry>/index.html.
Prompt used for every game: "make a minecraft clone as a single html"
"""
import os, re, shutil, datetime, html, json

SRC = "/Users/bluepaun/Workspace/13_llama-cpp-script/minecraft_test"
DST = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# (test dir, entry suffix, main html inside it, extra files to copy alongside)
MANIFEST = [
    ("test001-Nemotron-3-Super-120B-UD-Q4_K_XL", "", "index.html", ["script.js", "style.css"]),
    ("test002-gpt5.4", "", "index.html", ["game.js", "style.css"]),
    ("test003-OmniCoder-2-9B-Q8_0", "", "minecraft.html", []),
    ("test004-Qwen3-Coder_Next-UD-Q4_K_KL", "", "minecraft.html", []),
    ("test005-Qwen3-Coder-Next-UD-Q8_K_XL", "", "minecraft.html", []),
    ("test006-Qwen3.5-122B-A10B-UD-Q4_K_KL", "", "minecraft.html", []),
    ("test007-Qwen3.5-122B-A10B-UD-Q4_K_KL-Coder", "", "minecraft.html", []),
    ("test008-Qwen3.5-27B-UD-Q8_K_XL", "", "minecraft.html", []),
    ("test010-Gemma-4-31B-Q8_K_KL", "", "index.html", []),
    ("test012-MiniMax2.5-UD-Q3_K_XL", "", "minecraft.html", []),
    ("test013-supergemma", "", "index.html", ["main.js", "style.css"]),
    ("test014-Gemma-4-26B-A4B-Q8_K_KL", "", "minecraft_clone.html", []),
    ("test015-Qwen3.6-35B-BF16-Coder", "", "minecraft.html", []),
    ("test016-Qwen3.6-35B-Q4_K_XL", "", "minecraft.html", []),
    ("test017-Qwen3.6-27B-Q8_K_XL", "", "minecraft.html", []),
    ("test018-qwen3.6_Q8_K_XL+parallel-thinking", "", "minecraft.html", []),
    ("test019-MiniMax-M2.7-UD-IQ4_XS", "", "minecraft.html", []),
    ("test020-20260506", "", "minecraft.html", []),
    ("test021-20260507", "", "minecraft.html", []),
    ("test022-OD", "", "index.html", []),
    ("test023-OD", "-pi", "pi/minecraft.html", []),
    ("test024-gemma", "", "minecraft_clone.html", []),
    ("test025-minimax", "", "index.html", []),
    ("test026-pi-agent", "-a", "qwen3.5-122b-q5-proxy.html", []),
    ("test026-pi-agent", "-b", "qwen3.6-bf16-proxy.html", []),
    ("test027-pi-qwen3.6-27b-mtp", "", "minecraft.html", []),
    ("test028-Step-3.7-Flash-IQ4_XS", "", "minecraft.html", []),
    ("test029-Step-3.7-Flash-Q4_K_S", "", "minecraft.html", []),
    ("test030-step-proxy", "", "minecraft-clone.html", []),
    ("test031-gpt-fable", "", "minecraft.html", []),
    ("test032-laguna", "", "minecraft_clone.html", []),
    ("test033-deepseek", "", "index.html", []),
    ("test034-deepseek", "", "minecraft-clone.html", []),
    ("test035-step", "", "minecraft.html", []),
    ("test036-deep", "", "minecraft.html", []),
    ("test037-qwen3.8", "", "index.html", []),
    ("test039-ornith", "", "minecraft.html", []),
    ("test040-r9700-qwen38-q4", "", "index.html", []),
    ("test041-qwen3.8-next-flash", "", "minecraft.html", []),
    ("test042-strata-iq3_s", "", "index.html", []),
    ("test044-helogen", "", "voxelcraft.html", []),
]

# Folders that exist in the original tree but hold no result of this prompt.
SKIPPED = {
    "test009-Nemotron-Cascade-2-30B-Q6_K_L": "빈 폴더 (출력 없음)",
    "test011-Qwen3.5-397B-UD-IQ1_M-Coder": "빈 폴더 (출력 없음)",
    "test038-multi": "마리오/히어로 아레나 등 다른 프롬프트 결과만 있음",
    "test043-strata-iq4_xs": "빈 폴더 (출력 없음)",
}
VARIANTS = [
    "test010-Gemma-4-31B-Q8_K_KL/minecraft_game/index.html — style.css/game.js 참조가 깨져서 제외",
    "test018-qwen3.6_Q8_K_XL+parallel-thinking/backup-fold|backup2|backup3 — 백업 사본, 메인본만 포함",
    "test023-OD/index.html(838B 스텁), test023-OD/pi/minecraft2.html — 사본으로 제외",
    "test034-deepseek/minecraft-clone-2d.html — 2D 변형(별도 후속 프롬프트)",
    "test037-qwen3.8/index, index copy.html, flight/flight-sim.html — 중복/다른 프롬프트",
    "test038-multi/*, test040의 gta|mario|fps, test041의 fps|mario, test026-pi-agent의 eye|tree|seasons|speed — 다른 프롬프트 결과",
]


def slugify(name: str) -> str:
    s = re.sub(r"^test(\d+)-", "", name)
    s = s.lower().replace("_", "-").replace("+", "-")
    s = re.sub(r"[^a-z0-9.-]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-.")
    return s


def title_of(path: str) -> str:
    txt = open(path, encoding="utf-8", errors="ignore").read(4000)
    m = re.search(r"<title>(.*?)</title>", txt, re.S | re.I)
    return html.unescape(re.sub(r"\s+", " ", m.group(1)).strip()) if m else "(no title)"


def build():
    entries = []
    for d, suffix, main, extra in MANIFEST:
        src = os.path.join(SRC, d)
        num = re.match(r"test(\d+)", d).group(1)
        slug = f"{num}-{slugify(d)}{suffix}"
        outdir = os.path.join(DST, "games", slug)
        os.makedirs(outdir, exist_ok=True)
        srcfile = os.path.join(src, main)
        shutil.copy2(srcfile, os.path.join(outdir, "index.html"))
        for e in extra:
            shutil.copy2(os.path.join(src, e), os.path.join(outdir, e))

        # rewrite relative ./asset refs that were copied (test002 uses ./style.css etc.)
        idx = os.path.join(outdir, "index.html")
        txt = open(idx, encoding="utf-8", errors="ignore").read()
        for e in extra:
            txt = txt.replace("./" + e, e)
        open(idx, "w", encoding="utf-8").write(txt)

        size = os.path.getsize(idx)
        mtime = datetime.date.fromtimestamp(os.path.getmtime(idx))
        single = not extra
        cdn = "cdnjs.cloudflare.com" in txt or "jsdelivr" in txt or "unpkg" in txt
        entries.append({
            "id": slug, "num": num, "orig": d, "path": f"games/{slug}/index.html",
            "title": title_of(idx),
            "label": (re.sub(r"^test\d+-", "", d) + " \u00b7 " + os.path.splitext(os.path.basename(main))[0]) if suffix else re.sub(r"^test\d+-", "", d),
            "size": size, "date": mtime.isoformat(), "single": single, "cdn": cdn,
        })

    entries.sort(key=lambda e: (e["num"], e["id"]))
    json.dump(entries, open(os.path.join(DST, "games.json"), "w"), indent=1, ensure_ascii=False)
    return entries


if __name__ == "__main__":
    es = build()
    print(f"{len(es)} games copied -> {DST}/games")
