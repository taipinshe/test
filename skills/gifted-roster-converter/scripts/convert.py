#!/usr/bin/env python3
"""資優鑑定成績轉檔：把學校交來的成績輸入檔，轉成鑑定報名系統的「一人一列」薦送名單匯入檔。

不照抄學校篩好的薦送名單，而是從段考原始分數重算全年級百分等級，
依門檻（一般生 93、特殊身分 85）判斷資格，再回頭核對學校的名單與表格裡的 Pr 值。

用法：
    python convert.py 成績輸入檔.xlsx [更多檔案...] [--year 115] [--pr-general 93]
                      [--pr-special 85] [--out-dir 輸出資料夾] [--json]

結束代碼：0＝全部轉檔成功；1＝有檔案拒絕轉檔（原因寫在報告裡）；2＝參數錯誤。
"""
import argparse
import io
import json
import os
import sys
import unicodedata

import pandas as pd

# 輸出欄位名稱 → 工作表名稱裡可能出現的寫法（依序比對，先找到先用）
SUBJECTS = {
    '國文': ('國文', '國語'),
    '英語': ('英語', '英文'),
    '數學': ('數學',),
    '自然': ('自然', '生物', '理化'),
}
SPECIAL_KEYWORDS = ['障', '低收', '原住民', '新住民']   # 簡章列出的特殊身分
OUT_COLUMNS = ['學年度', '學校代碼', '學生姓名', '學號', '國文', '英語', '數學', '自然']
OUT_SHEET = '薦送名單'                                   # 與匯入範本的工作表名稱相同


class ConvertError(ValueError):
    """原始檔有問題、不能產出檔案時丟出。"""


def norm(v):
    """去掉前後空白、全形轉半形；空值回傳空字串。"""
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return ''
    if isinstance(v, float) and v == int(v):
        v = int(v)
    return unicodedata.normalize('NFKC', str(v)).strip()


def norm_no(v):
    """班級、座號：'０１'、'01'、1 都視為同一個。"""
    s = norm(v)
    return str(int(s)) if s.isdigit() else s


def find_sheet(sheet_names, aliases, kind):
    """用關鍵字找工作表，不受名稱前後空格影響。kind 是 'PR' 或 '薦送'。"""
    for alias in aliases:
        hits = [n for n in sheet_names if alias in n and kind in n.upper()]
        if hits:
            return hits[0]
    return None


def read_table(content, sheet_name):
    """讀一張工作表：自動找到有「學生姓名」的那一列當表頭，只留有姓名的列。"""
    raw = pd.read_excel(io.BytesIO(content), sheet_name=sheet_name, header=None)
    header_row = None
    for i in range(min(len(raw), 20)):
        if '學生姓名' in [norm(c) for c in raw.iloc[i].tolist()]:
            header_row = i
            break
    if header_row is None:
        raise ConvertError(f'工作表「{sheet_name.strip()}」找不到「學生姓名」表頭')
    cols = [norm(c) for c in raw.iloc[header_row].tolist()]
    df = raw.iloc[header_row + 1:].copy()
    df.columns = [c if c else f'_空欄{i}' for i, c in enumerate(cols)]
    df['學生姓名'] = df['學生姓名'].map(norm)
    df = df[df['學生姓名'] != ''].reset_index(drop=True)
    for col in ('班級', '座號'):
        df[col] = df[col].map(norm_no) if col in df.columns else ''
    mark_cols = [c for c in df.columns if '特殊身分' in c]
    df['_身分'] = df[mark_cols[0]].map(norm) if mark_cols else ''
    df['_key'] = list(zip(df['班級'], df['座號'], df['學生姓名']))
    return df


def percentile_rank(totals):
    """與市府成績輸入表相同的算法 PERCENTRANK.INC(全年級, 該生)*100：
    贏過的人數 ÷（總人數－1），取到小數第一位、無條件捨去。"""
    n = len(totals)
    if n < 2:
        raise ConvertError('人數不足，無法計算百分等級')
    values = list(totals)
    return [((sum(1 for t in values if t < x) * 1000) // (n - 1)) / 10 for x in values]


def _fmt_pr(pr_of, key):
    pr, mark = pr_of.get(key, ('查無此人', ''))
    return f'{key[2]}(PR{pr}{"，" + mark if mark else ""})'


def convert(filename, content, school_year=115, pr_general=93, pr_special=85, out_dir='.'):
    """轉一個檔案。成功回傳報告 dict；原始檔有問題時丟 ConvertError，不產出檔案。"""
    try:
        sheet_names = pd.ExcelFile(io.BytesIO(content)).sheet_names
    except Exception as e:  # 不是 Excel、檔案毀損、有密碼
        raise ConvertError(f'無法用 Excel 格式開啟：{e}') from e

    students = {}        # key -> 該生一列
    roster_pos = {}      # key -> 在名冊中的位置，輸出時依名冊順序排列
    problems = []        # 需要人工確認的事項
    subjects = []        # 各科摘要

    for subject, aliases in SUBJECTS.items():
        pr_sheet = find_sheet(sheet_names, aliases, 'PR')
        if pr_sheet is None:
            raise ConvertError(f'找不到「{subject}」的PR計算工作表（工作表有：{"、".join(s.strip() for s in sheet_names)}），'
                               '為避免產出少一科的名單，本檔不轉檔')
        df = read_table(content, pr_sheet)

        exam_cols = [c for c in df.columns if c.startswith('段考')]
        if not exam_cols:
            raise ConvertError(f'「{pr_sheet.strip()}」找不到段考分數欄（欄名要以「段考」開頭）')
        scores = df[exam_cols].apply(pd.to_numeric, errors='coerce')
        missing = df.loc[scores.isna().any(axis=1), '學生姓名'].tolist()
        if missing:
            problems.append(f'{subject}：{len(missing)} 人有段考分數空白或不是數字（空白以0分計，人仍算在全年級人數裡）：'
                            f'{"、".join(missing[:10])}')
        df['_總分'] = scores.fillna(0).sum(axis=1)
        df['_PR'] = percentile_rank(df['_總分'].tolist())

        if df['_key'].duplicated().any():
            problems.append(f'{subject}：名冊有重複的「班級＋座號＋姓名」，請檢查原始檔')

        # 與學校表格裡已算好的 Pr值 對照
        if 'Pr值' in df.columns:
            school_pr = pd.to_numeric(df['Pr值'], errors='coerce')
            bad = df[(school_pr - df['_PR']).abs() > 0.05]
            if len(bad):
                problems.append(f'{subject}：{len(bad)} 人「學校表格的Pr值」與重算結果不同，例如 '
                                + '、'.join(f'{r["學生姓名"]}(學校{school_pr[i]}／重算{r["_PR"]})'
                                           for i, r in bad.head(5).iterrows()))

        is_special = df['_身分'].map(lambda m: any(k in m for k in SPECIAL_KEYWORDS))
        unknown = sorted(set(m for m in df['_身分'] if m and not any(k in m for k in SPECIAL_KEYWORDS)))
        if unknown:
            problems.append(f'{subject}：特殊身分欄出現簡章沒有列的寫法 {unknown}，這些人先當一般生處理，請人工確認')

        by_general = df['_PR'] >= pr_general
        by_special = is_special & (df['_PR'] >= pr_special) & ~by_general
        qualified = df[by_general | by_special]

        for pos, key in enumerate(df['_key']):
            roster_pos.setdefault(key, pos)
        for key, name in zip(qualified['_key'], qualified['學生姓名']):
            if key not in students:
                students[key] = {c: None for c in OUT_COLUMNS}
                students[key].update({'學年度': school_year, '學生姓名': name})
            students[key][subject] = 1

        info = {'科目': subject, '工作表': pr_sheet.strip(), '全年級人數': len(df),
                '符合人數': len(qualified), '一般': int(by_general.sum()), '特殊身分': int(by_special.sum()),
                '學校名單人數': None, '學校名單多列': [], '學校名單漏列': []}

        # 回頭核對學校自己篩的薦送名單
        rec_sheet = find_sheet(sheet_names, aliases, '薦送')
        if rec_sheet is not None:
            rec = read_table(content, rec_sheet)
            if 'Pr值' in rec.columns:
                rec = rec[pd.to_numeric(rec['Pr值'], errors='coerce').notna()]
            school_keys, mine = set(rec['_key']), set(qualified['_key'])
            pr_of = dict(zip(df['_key'], zip(df['_PR'], df['_身分'])))
            info['學校名單人數'] = len(school_keys)
            info['學校名單多列'] = sorted(_fmt_pr(pr_of, k) for k in school_keys - mine)
            info['學校名單漏列'] = sorted(_fmt_pr(pr_of, k) for k in mine - school_keys)
            if info['學校名單多列']:
                problems.append(f'{subject}：學校名單有、但重算不符合資格：{"、".join(info["學校名單多列"])}')
            if info['學校名單漏列']:
                problems.append(f'{subject}：重算符合資格、但學校名單沒有列：{"、".join(info["學校名單漏列"])}')
        subjects.append(info)

    if not students:
        raise ConvertError('沒有任何學生符合資格，請檢查原始檔')

    order = sorted(students, key=lambda k: roster_pos[k])
    result = pd.DataFrame([students[k] for k in order], columns=OUT_COLUMNS)
    names = result['學生姓名']
    if names.duplicated().any():
        problems.append(f'符合名單裡有同名同姓的學生：{sorted(set(names[names.duplicated()]))}，請務必補上學號區分')

    os.makedirs(out_dir, exist_ok=True)
    base = os.path.splitext(os.path.basename(filename))[0]
    out_path = os.path.join(out_dir, f'已轉檔_{base}.xlsx')    # 一律用小寫 .xlsx，大寫 .XLSX 會讓 pandas 存檔失敗
    with pd.ExcelWriter(out_path, engine='openpyxl') as writer:
        result.to_excel(writer, sheet_name=OUT_SHEET, index=False)
        writer.book.properties.creator = 'User'
        writer.book.properties.lastModifiedBy = 'User'

    return {'來源檔': filename, '輸出檔': out_path, '合計人數': len(result), '學年度': school_year,
            '門檻': {'一般': pr_general, '特殊身分': pr_special},
            '各科': subjects, '請人工確認': problems}


def render(report):
    """把報告轉成給人看的文字。"""
    lines = []
    for s in report['各科']:
        line = f'{s["科目"]}：全年級 {s["全年級人數"]} 人，符合 {s["符合人數"]} 人（一般 {s["一般"]}、特殊身分 {s["特殊身分"]}）'
        if s['學校名單人數'] is None:
            line += '｜原始檔沒有薦送名單可核對'
        else:
            line += f'｜學校名單 {s["學校名單人數"]} 人'
            if not s['學校名單多列'] and not s['學校名單漏列']:
                line += '，與重算結果一致 ✅'
        lines.append(line)
    lines.append(f'合計 {report["合計人數"]} 位學生（一人一列），學年度填 {report["學年度"]}')
    lines.append(f'輸出檔：{report["輸出檔"]}')
    if report['請人工確認']:
        lines.append('\n⚠️ 請人工確認以下事項：')
        lines += [f'  - {p}' for p in report['請人工確認']]
    else:
        lines.append('沒有發現需要人工確認的事項。')
    lines.append('提醒：「學校代碼」「學號」兩欄原始檔沒有資料，需自行補上。')
    return '\n'.join(lines)


def main(argv=None):
    p = argparse.ArgumentParser(description='資優鑑定成績轉檔（一人一列薦送名單）')
    p.add_argument('files', nargs='+', help='學校交來的成績輸入檔（.xlsx／.XLSX）')
    p.add_argument('--year', type=int, default=115, help='匯入檔「學年度」欄要填的數字（預設 115）')
    p.add_argument('--pr-general', type=float, default=93, help='一般學生門檻（預設 93）')
    p.add_argument('--pr-special', type=float, default=85, help='特殊身分學生門檻（預設 85）')
    p.add_argument('--out-dir', default='.', help='輸出資料夾（預設目前資料夾）')
    p.add_argument('--json', action='store_true', help='改輸出 JSON 報告（給 agent 讀）')
    args = p.parse_args(argv)

    reports, failed = [], False
    for path in args.files:
        try:
            with open(path, 'rb') as f:
                content = f.read()
            r = convert(path, content, args.year, args.pr_general, args.pr_special, args.out_dir)
        except (OSError, ConvertError) as e:
            failed = True
            r = {'來源檔': path, '錯誤': str(e)}
        reports.append(r)

    if args.json:
        print(json.dumps(reports, ensure_ascii=False, indent=2))
    else:
        for r in reports:
            print(f'===== {r["來源檔"]} =====')
            print(f'❌ 沒有轉檔：{r["錯誤"]}' if '錯誤' in r else render(r))
            print()
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
