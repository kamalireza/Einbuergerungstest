#!/usr/bin/env python3
"""Extract 300 questions from the Einbuergerungstest PDF into questions.json."""

import json
import re
import sys
import os

import PyPDF2


def extract_answer_key(reader):
    """Parse answer key from page 95."""
    text = reader.pages[94].extract_text()
    answers = {}
    for match in re.finditer(r'(\d+)-([A-D])', text):
        qnum = int(match.group(1))
        ans = match.group(2)
        answers[qnum] = ans
    return answers


def get_category(qid):
    """Assign BAMF category based on question number."""
    if 1 <= qid <= 192:
        return "politik"
    elif 193 <= qid <= 281:
        return "geschichte"
    elif 282 <= qid <= 300:
        return "gesellschaft"
    return "unknown"


def get_subcategory(qid):
    """Assign subcategory based on question number ranges."""
    if 1 <= qid <= 40:
        return "grundrechte"
    elif 41 <= qid <= 62:
        return "staatsaufbau"
    elif 63 <= qid <= 88:
        return "verfassungsorgane"
    elif 89 <= qid <= 109:
        return "wahlen"
    elif 110 <= qid <= 130:
        return "parteien"
    elif 131 <= qid <= 149:
        return "sozialstaat"
    elif 150 <= qid <= 170:
        return "rechtsstaat"
    elif 171 <= qid <= 192:
        return "deutschland-in-europa"
    elif 193 <= qid <= 230:
        return "weimarer-republik"
    elif 231 <= qid <= 255:
        return "nationalsozialismus"
    elif 256 <= qid <= 270:
        return "nachkriegszeit"
    elif 271 <= qid <= 281:
        return "deutsche-einheit"
    elif 282 <= qid <= 290:
        return "religion"
    elif 291 <= qid <= 300:
        return "alltag"
    return "sonstige"


# Questions that reference images (from PDF pages 93-94)
IMAGE_QUESTIONS = {21, 55, 70, 102, 111, 121, 132, 135, 171, 182, 282}


def is_persian_char(ch):
    """Check if a character is in Arabic/Persian Unicode blocks."""
    cp = ord(ch)
    return (
        0x0600 <= cp <= 0x06FF or  # Arabic
        0x0750 <= cp <= 0x077F or  # Arabic Supplement
        0x08A0 <= cp <= 0x08FF or  # Arabic Extended-A
        0xFB50 <= cp <= 0xFDFF or  # Arabic Presentation Forms-A
        0xFE70 <= cp <= 0xFEFF or  # Arabic Presentation Forms-B
        0x0660 <= cp <= 0x0669 or  # Arabic-Indic digits
        0x06F0 <= cp <= 0x06F9     # Extended Arabic-Indic digits
    )


def has_persian(text):
    """Check if text contains any Persian/Arabic characters."""
    return any(is_persian_char(ch) for ch in text)


def strip_trailing_persian_marker(text):
    """Remove trailing Persian option marker like ۰) ۷) ۰) ۴) from text."""
    return re.sub(r'\s*[۰-۹٠-٩]+\)\s*$', '', text.strip())


def deduplicate_text(text):
    """If text appears to be duplicated (same words repeated), take first half."""
    text = text.strip()
    # Try splitting on multiple spaces (common PDF artifact for dual-column)
    parts = re.split(r'\s{2,}', text)
    if len(parts) == 2:
        # Normalize for comparison
        norm = lambda s: re.sub(r'\s+', ' ', re.sub(r'\s*-\s*', '-', s)).strip().lower()
        if norm(parts[0]) == norm(parts[1]) or \
           norm(parts[0]).replace(' ', '') == norm(parts[1]).replace(' ', ''):
            return parts[0].strip()

    # Also try word-based deduplication
    words = text.split()
    n = len(words)
    if n < 2:
        return text
    half = n // 2
    first = ' '.join(words[:half])
    second = ' '.join(words[half:2*half])
    norm = lambda s: re.sub(r'\s*-\s*', '-', s).lower().replace(' ', '')
    if norm(first) == norm(second):
        return first
    return text


def fix_pdf_spaces(text):
    """Fix common PDF extraction artifacts like spaces in the middle of words.

    Only fix cases where a single uppercase letter is clearly part of a split word,
    i.e., the letter is preceded by whitespace/start and followed by space+lowercase
    that forms a recognizable word fragment (not a separate word like articles).
    """
    # Only fix at start of text or after whitespace, where a single uppercase
    # letter is followed by space then lowercase (e.g., "M enschen" -> "Menschen")
    # But NOT "die Regierung" where both are valid words
    def fix_single_letter_split(m):
        before = m.group(1) or ''
        letter = m.group(2)
        rest = m.group(3)
        # Don't fix if the result would be a 1-2 letter word followed by a proper word
        # Common German articles/prepositions to skip: we only fix if the single letter
        # + rest doesn't start with a common word beginning
        return before + letter + rest

    text = re.sub(r'(^|\s)([A-ZÄÖÜ]) ([a-zäöüß]\w{3,})', fix_single_letter_split, text)
    return text


def split_german_persian(text):
    """Split mixed German+Persian text into (de, fa) parts.

    Strategy: Walk through the string character by character, tracking
    whether we're in a Latin or Persian segment. Collect segments.
    """
    text = strip_trailing_persian_marker(text.strip())
    if not text:
        return "", ""

    segments = []
    current_chars = []
    current_type = None  # 'latin' or 'persian'

    for ch in text:
        ch_type = None
        if is_persian_char(ch):
            ch_type = 'persian'
        elif ch.isalpha() or ch.isdigit():
            ch_type = 'latin'
        else:
            # Whitespace, punctuation - attach to current segment
            current_chars.append(ch)
            continue

        if current_type is None:
            current_type = ch_type
        elif ch_type != current_type:
            # Flush current segment
            seg_text = ''.join(current_chars).strip()
            if seg_text:
                segments.append((seg_text, current_type))
            current_chars = []
            current_type = ch_type

        current_chars.append(ch)

    # Flush last segment
    seg_text = ''.join(current_chars).strip()
    if seg_text:
        segments.append((seg_text, current_type or 'latin'))

    de_parts = [s[0] for s in segments if s[1] == 'latin']
    fa_parts = [s[0] for s in segments if s[1] == 'persian']

    de_text = deduplicate_text(' '.join(de_parts).strip())
    fa_text = ' '.join(fa_parts).strip()

    # If no Persian text but German text looks like proper nouns,
    # use German as Persian too (proper nouns stay the same)
    if not fa_text and de_text:
        fa_text = de_text

    return de_text, fa_text


def extract_questions(reader):
    """Extract all 300 questions from the PDF."""
    # Get all text from question pages (pages 4-92)
    all_text = ""
    for i in range(3, 92):  # 0-indexed
        all_text += reader.pages[i].extract_text() + "\n"

    # Split by "Frage N)" pattern
    question_splits = re.split(r'(?=Frage\s+\d+\))', all_text)

    questions = []

    for block in question_splits:
        block = block.strip()
        if not block:
            continue

        # Match question number
        m = re.match(r'Frage\s+(\d+)\)\s*(.*)', block, re.DOTALL)
        if not m:
            continue

        qid = int(m.group(1))
        body = m.group(2)

        # Split body into lines
        lines = [l.strip() for l in body.split('\n') if l.strip()]

        # Remove page headers
        lines = [l for l in lines if
                 not re.match(r'^آزمون تابعیت آلمان', l) and
                 not re.match(r'^\d+\s*$', l) and
                 l != '21. Januar 2017']

        # Separate question text from options
        question_lines = []
        option_lines = {"A": [], "B": [], "C": [], "D": []}
        current_option = None

        for line in lines:
            # Check if line starts with a Latin option letter or digit (1-4 maps to A-D)
            opt_match = re.match(r'^([A-D])\)\s*(.*)', line)
            digit_match = re.match(r'^([1-4])\)\s*(.*)', line) if not opt_match else None
            if digit_match:
                key_map = {'1': 'A', '2': 'B', '3': 'C', '4': 'D'}
                current_option = key_map[digit_match.group(1)]
                rest = digit_match.group(2).strip()
                if rest:
                    option_lines[current_option].append(rest)
                continue
            if opt_match:
                current_option = opt_match.group(1)
                rest = opt_match.group(2).strip()
                if rest:
                    option_lines[current_option].append(rest)
            elif current_option:
                # Continuation of current option
                option_lines[current_option].append(line)
            else:
                question_lines.append(line)

        # Parse question text - contains both German and Persian
        q_raw = " ".join(question_lines)

        # The Persian question starts with سؤال followed by Persian digits and )
        # Split on this marker
        q_parts = re.split(r'سؤال\s*[۰-۹٠-٩]+\)', q_raw)

        if len(q_parts) >= 2:
            de_q = q_parts[0].strip()
            fa_q = strip_trailing_persian_marker(q_parts[1].strip())
        else:
            de_q, fa_q = split_german_persian(q_raw)

        # Clean German text: remove any remaining Persian characters
        de_q_clean = []
        for ch in de_q:
            if is_persian_char(ch):
                break
            de_q_clean.append(ch)
        de_q = ''.join(de_q_clean).strip()

        # Parse options
        parsed_options = []
        for key in ["A", "B", "C", "D"]:
            opt_raw = " ".join(option_lines[key]).strip()
            de_opt, fa_opt = split_german_persian(opt_raw)

            parsed_options.append({
                "key": key,
                "de": de_opt,
                "fa": fa_opt,
                "en": ""
            })

        # Apply PDF space fixes
        de_q = fix_pdf_spaces(de_q)
        for opt in parsed_options:
            opt["de"] = fix_pdf_spaces(opt["de"])

        question = {
            "id": qid,
            "category": get_category(qid),
            "subcategory": get_subcategory(qid),
            "question": {
                "de": de_q,
                "fa": fa_q,
                "en": ""
            },
            "options": parsed_options,
            "correctAnswer": "",
            "imageRef": f"q{qid}.webp" if qid in IMAGE_QUESTIONS else None
        }

        questions.append(question)

    return questions


def main():
    pdf_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "citzenship.pdf")

    print(f"Reading PDF: {pdf_path}")
    reader = PyPDF2.PdfReader(pdf_path)

    # Extract answer key
    answers = extract_answer_key(reader)
    print(f"Extracted {len(answers)} answers from answer key")

    # Extract questions
    questions = extract_questions(reader)
    print(f"Extracted {len(questions)} questions")

    # Merge answer key
    for q in questions:
        if q["id"] in answers:
            q["correctAnswer"] = answers[q["id"]]
        else:
            print(f"WARNING: No answer for question {q['id']}")

    # Sort by ID
    questions.sort(key=lambda q: q["id"])

    # Verify completeness
    ids = [q["id"] for q in questions]
    missing = [i for i in range(1, 301) if i not in ids]
    if missing:
        print(f"WARNING: Missing questions: {missing}")

    duplicates = [i for i in ids if ids.count(i) > 1]
    if duplicates:
        print(f"WARNING: Duplicate questions: {set(duplicates)}")

    # Count empty fields
    empty_de_q = sum(1 for q in questions if not q["question"]["de"])
    empty_fa_q = sum(1 for q in questions if not q["question"]["fa"])
    empty_de_opt = sum(1 for q in questions for o in q["options"] if not o["de"])
    empty_fa_opt = sum(1 for q in questions for o in q["options"] if not o["fa"])
    print(f"Empty German questions: {empty_de_q}")
    print(f"Empty Persian questions: {empty_fa_q}")
    print(f"Empty German options: {empty_de_opt}")
    print(f"Empty Persian options: {empty_fa_opt}")

    # Output
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "data")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "questions.json")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"\nWritten to {output_path}")

    # Print category stats
    cats = {}
    for q in questions:
        cats[q["category"]] = cats.get(q["category"], 0) + 1
    print(f"Categories: {cats}")

    # Print samples
    for sample_id in [1, 50, 100, 200, 300]:
        q = questions[sample_id - 1]
        print(f"\n--- Question {q['id']} ---")
        print(f"  DE: {q['question']['de'][:100]}")
        print(f"  FA: {q['question']['fa'][:100]}")
        print(f"  Answer: {q['correctAnswer']}")
        for opt in q["options"]:
            print(f"  {opt['key']}) DE: {opt['de'][:50]} | FA: {opt['fa'][:50]}")


if __name__ == "__main__":
    main()
