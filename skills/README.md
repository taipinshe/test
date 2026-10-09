# Skills

| Skill | 用途 |
|---|---|
| [`gifted-roster-converter`](gifted-roster-converter/SKILL.md) | 資優鑑定成績轉檔：學校成績輸入檔 → 報名系統「一人一列」薦送名單匯入檔；從原始分數重算百分等級，並核對學校名單 |

## 安裝方式

每個 skill 是一個資料夾，裡面有 `SKILL.md`（給 agent 讀的說明）、`scripts/`（實際做事的程式）和 `references/`（規則依據）。這是 Agent Skills 的開放格式，支援 `SKILL.md` 的 agent 都能直接使用。

| Agent | 安裝方式 |
|---|---|
| **Claude（claude.ai 網頁／桌面版）** | 下載 `gifted-roster-converter.zip`，到「設定 → 功能（Capabilities）→ Skills」上傳。需要開啟程式碼執行功能。 |
| **Claude Code** | 把整個 `gifted-roster-converter` 資料夾複製到 `~/.claude/skills/`（個人，所有專案都能用），或專案裡的 `.claude/skills/`（只有這個專案能用）。 |
| **其他支援 Skills 的 agent**（Gemini CLI、Antigravity、Codex 等） | 把資料夾放進該 agent 的 skills 資料夾。各家的路徑不同，請查該 agent 的說明。 |
| **不支援 Skills 的 agent** | 把 `SKILL.md` 的內容貼成指示，並把 `scripts/convert.py` 一起提供給它執行。 |

執行環境需要 Python 3，以及 `pip install pandas openpyxl`。

沒有 agent 可用的同仁，可以改用 Colab 筆記本 `資優名單轉檔工具.ipynb`：按 ▶ 執行，上傳檔案後就會自動下載轉好的檔。它的判斷邏輯和這個 skill 相同。

## 測試

```bash
pip install pandas openpyxl pytest
python -m pytest skills/gifted-roster-converter/tests -q
```

測試只使用 `make_sample.py` 產生的假資料，**repo 裡不放任何真實學生的成績檔**。
