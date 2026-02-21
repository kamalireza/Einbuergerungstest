#!/usr/bin/env python3
"""
Fix trilingual consistency issues in questions.json.

Fixes:
1. German OCR artifacts (spurious spaces in words)
2. Persian number/date corruption (garbled digits from OCR)
3. Persian text truncation/empty (options that are just "و")
4. Persian content mismatches (wrong ages, dates, terms)
5. German duplicate text in party-name options
"""

import json
import re
import sys
from pathlib import Path

QUESTIONS_PATH = Path(__file__).parent.parent / "src" / "data" / "questions.json"

# ─── Counters ───
stats = {"de_ocr": 0, "fa_numbers": 0, "fa_text": 0, "fa_mismatch": 0, "de_dupes": 0}


def load_questions():
    with open(QUESTIONS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_questions(data):
    with open(QUESTIONS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


# ═══════════════════════════════════════════════════════
# 1. German OCR artifact fixes
# ═══════════════════════════════════════════════════════

# Known OCR split-word patterns found in audit.
# These are explicit replacements for safety.
DE_OCR_FIXES = {
    "hab en": "haben",
    "Gelds trafe": "Geldstrafe",
    "besch äftigt": "beschäftigt",
    "Demo kratie": "Demokratie",
    "W er": "Wer",
    "We r": "Wer",
    "ei ne": "eine",
    "daz u": "dazu",
    "Deut schland": "Deutschland",
    "Deutschlan d": "Deutschland",
    "ko ntrolliert": "kontrolliert",
    "Demokratisc he": "Demokratische",
    "Bundespräs ident": "Bundespräsident",
    "en tscheiden": "entscheiden",
    "wu rden": "wurden",
    "S PD": "SPD",
    "D DR": "DDR",
    "Bunde stag": "Bundestag",
    "we lchem": "welchem",
    "rege lmäßig": "regelmäßig",
    "teile n": "teilen",
    "elter liche": "elterliche",
    "Feier tage": "Feiertage",
    "d ie": "die",
    "SED -Parteitag": "SED-Parteitag",
    "Wahl pflicht": "Wahlpflicht",
    "Bundes tag": "Bundestag",
    "Reli gionsfreiheit": "Religionsfreiheit",
    "Gleich berechtigung": "Gleichberechtigung",
    "Grund gesetz": "Grundgesetz",
    "Verfass ung": "Verfassung",
    "Bürger meister": "Bürgermeister",
    "Bundes kanzler": "Bundeskanzler",
    "Bundes land": "Bundesland",
    "Bundes länder": "Bundesländer",
    "Bundes rat": "Bundesrat",
    "Bundes regierung": "Bundesregierung",
    "Bundes verfassungsgericht": "Bundesverfassungsgericht",
    "Europa parlaments": "Europaparlaments",
    "Koali tionsvertrag": "Koalitionsvertrag",
    "Koali tion": "Koalition",
    "Meinungs freiheit": "Meinungsfreiheit",
    "Menschen rechte": "Menschenrechte",
    "Presse freiheit": "Pressefreiheit",
    "Rechts staat": "Rechtsstaat",
    "Sozial staat": "Sozialstaat",
    "Versamm lungsfreiheit": "Versammlungsfreiheit",
    "Volks souveränität": "Volkssouveränität",
    "Wahl recht": "Wahlrecht",
}


def fix_de_ocr(text):
    """Fix German OCR artifacts - spurious spaces in compound words."""
    original = text
    for bad, good in DE_OCR_FIXES.items():
        text = text.replace(bad, good)
    return text, text != original


# ═══════════════════════════════════════════════════════
# 2. German duplicate text in party-name options
# ═══════════════════════════════════════════════════════

# Pattern: "CDU und SSW   CDU SSW" → "CDU und SSW"
# The duplicate part after triple-space is OCR noise
DE_DUPE_PATTERN = re.compile(r'^(.+?)\s{2,}.+$')


def fix_de_dupes(text):
    """Remove duplicate trailing text in German party-name options."""
    m = DE_DUPE_PATTERN.match(text)
    if m:
        cleaned = m.group(1).strip()
        # Only fix if the duplicate part looks like party abbreviations
        # (check the trailing portion contains only uppercase letters, spaces, slashes, dots)
        trailing = text[m.end(1):].strip()
        if trailing and re.match(r'^[A-ZÄÖÜa-zäöü0-9\s/.\-]+$', trailing):
            return cleaned, True
    return text, False


# ═══════════════════════════════════════════════════════
# 3. Persian number/digit corruption fixes
# ═══════════════════════════════════════════════════════

LATIN_TO_PERSIAN_DIGITS = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")
PERSIAN_TO_LATIN_DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")


def to_persian_digits(s):
    """Convert Latin digits to Persian digits."""
    return s.translate(LATIN_TO_PERSIAN_DIGITS)


def extract_latin_numbers(text):
    """Extract all numbers from a Latin text string."""
    return re.findall(r'\d+', text)


def is_number_option(de_text):
    """Check if a German option is primarily numeric (possibly with %, year ranges, etc.)."""
    cleaned = re.sub(r'[%.\s,\-/]', '', de_text)
    return bool(re.match(r'^\d+$', cleaned))


# ═══════════════════════════════════════════════════════
# 4. Specific question fixes (manual overrides)
# ═══════════════════════════════════════════════════════

def get_manual_fixes():
    """Return a dict of question_id -> fix_function."""
    fixes = {}

    # --- Q2: Persian question says "under 10" but should say "until 14th birthday" ---
    def fix_q2(q):
        q["question"]["fa"] = "در آلمان والدین می‌توانند تا ۱۴ سالگی فرزندشان تصمیم بگیرند که آیا کودک در مدرسه در کلاس ... شرکت کند."
        stats["fa_mismatch"] += 1

    fixes[2] = fix_q2

    # --- Q24: Persian numbers garbled (14→۴۰, 15→۱۰, 16→۶۰, 17→۲۰) ---
    def fix_q24(q):
        correct = ["۱۴", "۱۵", "۱۶", "۱۷"]
        for i, opt in enumerate(q["options"]):
            opt["fa"] = correct[i]
        stats["fa_numbers"] += 4

    fixes[24] = fix_q24

    # --- Q59: All Persian options are just "و", German has duplicates ---
    def fix_q59(q):
        q["question"]["fa"] = "کدام احزاب آلمان در سال ۲۰۰۷ با یکدیگر حزب Die Linke را تشکیل دادند؟"
        q["options"][0]["fa"] = "CDU و SSW"
        q["options"][1]["fa"] = "PDS و WASG"
        q["options"][2]["fa"] = "CSU و FDP"
        q["options"][3]["fa"] = "اتحاد ۹۰/سبزها و SPD"
        # Fix German duplicates
        q["options"][0]["de"] = "CDU und SSW"
        q["options"][1]["de"] = "PDS und WASG"
        q["options"][2]["de"] = "CSU und FDP"
        q["options"][3]["de"] = "Bündnis 90/Die Grünen und SPD"
        stats["fa_text"] += 4
        stats["fa_numbers"] += 1  # year fix
        stats["de_dupes"] += 4

    fixes[59] = fix_q59

    # --- Q73: Persian options broken, German has duplicates ---
    def fix_q73(q):
        q["options"][0]["fa"] = "CDU/CSU و SPD"
        q["options"][1]["fa"] = "Die Linke و اتحاد ۹۰/سبزها"
        q["options"][2]["fa"] = "FDP و SPD"
        q["options"][3]["fa"] = "Die Linke و FDP"
        # Fix German duplicates
        q["options"][0]["de"] = "CDU/CSU und SPD."
        q["options"][1]["de"] = "Die Linke und Bündnis 90/Die Grünen."
        q["options"][2]["de"] = "FDP und SPD."
        q["options"][3]["de"] = "Die Linke und FDP."
        stats["fa_text"] += 4
        stats["de_dupes"] += 4

    fixes[73] = fix_q73

    # --- Q94: Ages garbled (16→۶۰, 18→۸۰, 21→۰۷, 23→۰۷) ---
    def fix_q94(q):
        correct = ["۱۶", "۱۸", "۲۱", "۲۳"]
        for i, opt in enumerate(q["options"]):
            opt["fa"] = correct[i]
        stats["fa_numbers"] += 4

    fixes[94] = fix_q94

    # --- Q107: "۷ سال" should be "۲ سال" ---
    def fix_q107(q):
        for opt in q["options"]:
            if "۷" in opt["fa"] and "2" in opt["de"]:
                opt["fa"] = opt["fa"].replace("۷", "۲")
                stats["fa_numbers"] += 1

    fixes[107] = fix_q107

    # --- Q108: Ages garbled (18→۸۰, 3→۰, 21→۰۷) ---
    def fix_q108(q):
        de_to_fa = {"18": "۱۸", "3": "۳", "21": "۲۱", "23": "۲۳"}
        for opt in q["options"]:
            nums = extract_latin_numbers(opt["de"])
            if nums:
                fa_text = opt["fa"]
                for n in nums:
                    if n in de_to_fa:
                        persian_num = de_to_fa[n]
                        # Replace garbled Persian number
                        fa_text = re.sub(r'[۰-۹]+', persian_num, fa_text, count=1)
                opt["fa"] = fa_text
                stats["fa_numbers"] += 1

    fixes[108] = fix_q108

    # --- Q117: Percentages garbled ---
    def fix_q117(q):
        correct = ["۳ درصد", "۴ درصد", "۵ درصد", "۶ درصد"]
        for i, opt in enumerate(q["options"]):
            opt["fa"] = correct[i]
        stats["fa_numbers"] += 4

    fixes[117] = fix_q117

    # --- Q123: Fix number ---
    def fix_q123(q):
        q["question"]["fa"] = re.sub(r'۵۱', '۵', q["question"]["fa"])
        stats["fa_numbers"] += 1

    fixes[123] = fix_q123

    # --- Q152: Year ranges garbled ---
    def fix_q152(q):
        correct = [
            "۱۹۱۸ تا ۱۹۲۳",
            "۱۹۰۰ تا ۱۹۱۸",
            "۱۹۳۳ تا ۱۹۴۵",
            "۱۹۴۹ تا ۱۹۶۳"
        ]
        for i, opt in enumerate(q["options"]):
            opt["fa"] = correct[i]
        stats["fa_numbers"] += 4

    fixes[152] = fix_q152

    # --- Q154: Year corruption ---
    def fix_q154(q):
        correct = ["۱۹۱۹", "۱۹۲۷", "۱۹۳۳", "۱۹۴۹"]
        for i, opt in enumerate(q["options"]):
            opt["fa"] = correct[i]
        stats["fa_numbers"] += 4

    fixes[154] = fix_q154

    # --- Q155: Year corruption ---
    def fix_q155(q):
        correct = ["۱۹۳۳", "۱۹۲۳", "۱۹۴۵", "۱۹۳۶"]
        for i, opt in enumerate(q["options"]):
            opt["fa"] = correct[i]
        stats["fa_numbers"] += 4

    fixes[155] = fix_q155

    # --- Q156: Year corruption ---
    def fix_q156(q):
        correct = ["۱۹۳۳", "۱۹۲۳", "۱۹۳۹", "۱۹۲۹"]
        for i, opt in enumerate(q["options"]):
            opt["fa"] = correct[i]
        stats["fa_numbers"] += 4

    fixes[156] = fix_q156

    # --- Q174: Year corruption ---
    def fix_q174(q):
        correct = ["۱۹۴۷", "۱۹۴۹", "۱۹۵۳", "۱۹۵۶"]
        for i, opt in enumerate(q["options"]):
            opt["fa"] = correct[i]
        stats["fa_numbers"] += 4

    fixes[174] = fix_q174

    # --- Q175: Numbers corruption ---
    def fix_q175(q):
        correct = ["۳", "۴", "۵", "۶"]
        for i, opt in enumerate(q["options"]):
            opt["fa"] = correct[i]
        stats["fa_numbers"] += 4

    fixes[175] = fix_q175

    # --- Q182: Year in question + all options are "و" ---
    def fix_q182(q):
        q["question"]["fa"] = "در سال ۱۹۴۶ چه احزابی اجباراً به تنها حزب جمهوری دمکراتیک آلمان شرقی (SED) پیوستند؟"
        q["options"][0]["fa"] = "KPD و SPD"
        q["options"][1]["fa"] = "SPD و CDU"
        q["options"][2]["fa"] = "CDU و FDP"
        q["options"][3]["fa"] = "KPD و CSU"
        # Fix German duplicates
        q["options"][0]["de"] = "KPD und SPD"
        q["options"][1]["de"] = "SPD und CDU"
        q["options"][2]["de"] = "CDU und FDP"
        q["options"][3]["de"] = "KPD und CSU"
        stats["fa_text"] += 4
        stats["fa_mismatch"] += 1  # year fix
        stats["de_dupes"] += 4

    fixes[182] = fix_q182

    # --- Q210: Date "۲۰ ژوئن ۰۱۹۰" → "۱۷ ژوئن ۱۹۵۳" ---
    def fix_q210(q):
        q["question"]["fa"] = "۱۷ ژوئن ۱۹۵۳ در DDR چه اتفاقی روی داد؟"
        stats["fa_mismatch"] += 1

    fixes[210] = fix_q210

    # --- Q213: Millions garbled (70→۳۲, 78→۸۲, 80→۳۸, 90→۳۹) ---
    def fix_q213(q):
        correct = ["۷۰ میلیون", "۷۸ میلیون", "۸۰ میلیون", "۹۰ میلیون"]
        for i, opt in enumerate(q["options"]):
            opt["fa"] = correct[i]
        stats["fa_numbers"] += 4

    fixes[213] = fix_q213

    # --- Q217: Year corruption ---
    def fix_q217(q):
        de_years = []
        for opt in q["options"]:
            nums = extract_latin_numbers(opt["de"])
            de_years.append(nums)
        # Set correct Persian years from German
        for i, opt in enumerate(q["options"]):
            nums = extract_latin_numbers(opt["de"])
            if nums:
                opt["fa"] = to_persian_digits(nums[0])
                stats["fa_numbers"] += 1

    fixes[217] = fix_q217

    # --- Q218: Year corruption ---
    def fix_q218(q):
        for opt in q["options"]:
            nums = extract_latin_numbers(opt["de"])
            if nums:
                opt["fa"] = to_persian_digits(nums[0])
                stats["fa_numbers"] += 1

    fixes[218] = fix_q218

    # --- Q219: Year corruption ---
    def fix_q219(q):
        for opt in q["options"]:
            nums = extract_latin_numbers(opt["de"])
            if nums:
                opt["fa"] = to_persian_digits(nums[0])
                stats["fa_numbers"] += 1

    fixes[219] = fix_q219

    # --- Q225: "چکسلواکی" → "جمهوری چک" ---
    def fix_q225(q):
        q["options"][0]["fa"] = "جمهوری چک"
        stats["fa_mismatch"] += 1

    fixes[225] = fix_q225

    # --- Q230: Numbers garbled ---
    def fix_q230(q):
        correct = ["۵", "۶", "۷", "۸"]
        for i, opt in enumerate(q["options"]):
            opt["fa"] = correct[i]
        stats["fa_numbers"] += 4

    fixes[230] = fix_q230

    # --- Q235: Image reference "۱۰۷" → "۲۳۵" ---
    def fix_q235(q):
        q["question"]["fa"] = q["question"]["fa"].replace("۱۰۷", "۲۳۵")
        stats["fa_numbers"] += 1

    fixes[235] = fix_q235

    # --- Q236: EU member numbers garbled ---
    def fix_q236(q):
        correct = ["۲۱", "۲۳", "۲۵", "۲۸"]
        for i, opt in enumerate(q["options"]):
            opt["fa"] = correct[i]
        stats["fa_numbers"] += 4

    fixes[236] = fix_q236

    # --- Q245: Age pairs garbled ---
    def fix_q245(q):
        correct = [
            "۲۰ ساله و ۱۹ ساله",
            "۲۰ ساله و ۴۵ ساله",
            "۱۸ ساله و ۳۴ ساله",
            "۲۰ ساله و ۱۷ ساله"
        ]
        for i, opt in enumerate(q["options"]):
            opt["fa"] = correct[i]
        stats["fa_numbers"] += 4

    fixes[245] = fix_q245

    # --- Q246: Ages garbled ---
    def fix_q246(q):
        correct = ["۱۶", "۱۸", "۱۹", "۲۱"]
        for i, opt in enumerate(q["options"]):
            opt["fa"] = correct[i]
        stats["fa_numbers"] += 4

    fixes[246] = fix_q246

    # --- Q263: Age "۴۰ سالگی" → "۱۴ سالگی" ---
    def fix_q263(q):
        q["question"]["fa"] = q["question"]["fa"].replace("باالی ۴۰ سالی", "۱۴ ساله و بالاتر")
        if "۴۰" in q["question"]["fa"]:
            q["question"]["fa"] = q["question"]["fa"].replace("۴۰", "۱۴")
        stats["fa_mismatch"] += 1

    fixes[263] = fix_q263

    # --- Q267: Age "۷۷ ساله" → "۲۲ ساله" ---
    def fix_q267(q):
        q["question"]["fa"] = q["question"]["fa"].replace("۷۷ ساله", "۲۲ ساله")
        stats["fa_mismatch"] += 1

    fixes[267] = fix_q267

    # --- Q268: Duration "۳۰ سال" → "۱۰ سال" ---
    def fix_q268(q):
        q["question"]["fa"] = q["question"]["fa"].replace("۳۰ سال", "۱۰ سال")
        stats["fa_mismatch"] += 1

    fixes[268] = fix_q268

    # --- Q226: Image reference garbled ---
    def fix_q226(q):
        q["question"]["fa"] = q["question"]["fa"].replace("۶۷۷", "۲۲۶")
        stats["fa_numbers"] += 1

    fixes[226] = fix_q226

    return fixes


# ═══════════════════════════════════════════════════════
# 5. Scan for additional number-only options
# ═══════════════════════════════════════════════════════

def fix_numeric_options_auto(q):
    """For options where German is purely numeric, regenerate Persian digits."""
    fixed = 0
    for opt in q["options"]:
        de = opt["de"].strip().rstrip(".")
        # Check if German option is a simple number (with optional %, ., -)
        if is_number_option(de):
            expected_fa = to_persian_digits(de)
            # Replace % with Persian equivalent
            expected_fa = expected_fa.replace("%", "٪")
            current_fa = opt["fa"].strip()
            if current_fa != expected_fa and current_fa != to_persian_digits(de.replace("%", " درصد")):
                # Verify the current FA doesn't match what we expect
                # Only fix if the Persian is clearly wrong (different digit count or wrong digits)
                latin_current = current_fa.translate(PERSIAN_TO_LATIN_DIGITS)
                if latin_current != de.strip().rstrip("."):
                    opt["fa"] = expected_fa
                    fixed += 1
    return fixed


# ═══════════════════════════════════════════════════════
# 6. Fix garbled Persian image references in questions
# ═══════════════════════════════════════════════════════

def fix_fa_image_refs(q):
    """Fix Persian image reference numbers to match the question ID."""
    qid = q["id"]
    fa_q = q["question"]["fa"]
    # Pattern: )تصویر  ۱۰۷( or (تصویر ۲۳۵)
    # The Persian uses reversed parens: )...(
    match = re.search(r'تصویر\s+[۰-۹]+', fa_q)
    if match:
        expected_num = to_persian_digits(str(qid))
        current_num = re.search(r'[۰-۹]+', match.group()).group()
        if current_num != expected_num:
            q["question"]["fa"] = fa_q.replace(current_num, expected_num)
            return 1
    return 0


# ═══════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════

def main():
    print("Loading questions.json...")
    questions = load_questions()
    print(f"Loaded {len(questions)} questions")

    manual_fixes = get_manual_fixes()

    for q in questions:
        qid = q["id"]

        # --- Apply manual fixes first (these take priority) ---
        if qid in manual_fixes:
            manual_fixes[qid](q)

        # --- Fix German OCR artifacts across all fields ---
        q_de, changed = fix_de_ocr(q["question"]["de"])
        if changed:
            q["question"]["de"] = q_de
            stats["de_ocr"] += 1

        for opt in q["options"]:
            opt_de, changed = fix_de_ocr(opt["de"])
            if changed:
                opt["de"] = opt_de
                stats["de_ocr"] += 1

        # --- Fix German duplicates in party-name style options ---
        # Only for questions NOT already manually fixed
        if qid not in manual_fixes:
            for opt in q["options"]:
                opt_de, changed = fix_de_dupes(opt["de"])
                if changed:
                    opt["de"] = opt_de
                    stats["de_dupes"] += 1

        # --- Fix Persian image references ---
        img_fixes = fix_fa_image_refs(q)
        if img_fixes:
            stats["fa_numbers"] += img_fixes

        # --- Auto-fix numeric-only options (Q1-300 only) ---
        if qid <= 300 and qid not in manual_fixes:
            auto_fixed = fix_numeric_options_auto(q)
            stats["fa_numbers"] += auto_fixed

    # ── Validation ──
    print("\n--- Validation ---")
    errors = 0
    for q in questions:
        qid = q["id"]
        # Q1-300: no empty de, en, or fa fields
        if qid <= 300:
            for field_name in ["de", "fa", "en"]:
                if not q["question"].get(field_name, "").strip():
                    print(f"  ERROR: Q{qid} question.{field_name} is empty")
                    errors += 1
                for opt in q["options"]:
                    if not opt.get(field_name, "").strip():
                        print(f"  ERROR: Q{qid} option {opt['key']}.{field_name} is empty")
                        errors += 1
        # Q301-310: fa expected empty
        elif 301 <= qid <= 310:
            for field_name in ["de", "en"]:
                if not q["question"].get(field_name, "").strip():
                    print(f"  ERROR: Q{qid} question.{field_name} is empty")
                    errors += 1

    print(f"\nFixes applied:")
    print(f"  German OCR artifacts:       {stats['de_ocr']}")
    print(f"  German duplicate text:      {stats['de_dupes']}")
    print(f"  Persian number corrections: {stats['fa_numbers']}")
    print(f"  Persian text rewrites:      {stats['fa_text']}")
    print(f"  Persian content mismatches: {stats['fa_mismatch']}")
    print(f"  Total fixes:                {sum(stats.values())}")
    print(f"\nValidation errors: {errors}")

    if errors > 0:
        print("\n⚠ Some validation errors remain. Review manually.")

    save_questions(questions)
    print(f"\nSaved to {QUESTIONS_PATH}")
    return 0 if errors == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
