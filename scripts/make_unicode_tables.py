"""Generate /src/unicode_data.js from Unicode database files downloaded from
unicode.org by script downloads.py.
"""

import os
import unicodedata

dest_dir = os.path.join(os.path.dirname(os.getcwd()), "www", "src")

# Generate lists of character by General Category under a compact format.
# For each General Category (eg "Ll" for Letter lowercase), a list of items is
# generated. Each item in the list is:
# - an integer : the value of a Unicode code point which has this GC
# - a list with 3 elements : [start, number, step] such that all Unicode code
#   points of the form start + i * step for i in range(number) has this GC
# - a list with 2 elements [start, number] when step is 1
digits_mapping = {}

start = None
gc = None

bidi_ws = [] # characters with bidirectional class in "WS", "B", "S"
count = {}

def to_int(codepoint):
    return int("0x" + codepoint, 16)

with open(os.path.join("ucd", "UnicodeData.txt")) as f:
    for line in f:
        parts = line.split(";")
        gc = parts[2]
        count[gc] = count.get(gc, 0) + 1
        char = to_int(parts[0])
        bidi_class = parts[4]
        if gc == 'Nd':
            digits_mapping[char] = int(parts[6])
            int(chr(char))
        elif gc == 'No':
            try:
                print('to int', int(chr(char)))
            except:
                pass
        if bidi_class in ["WS", "B", "S"]:
            bidi_ws.append(char)

# check that digits_mapping groups codepoints by sequences of 10, each
# sequence mapping codepoint #i to integer i
# Store the start of each sequence in digits_starts
# Used in py_int.js to get the correct result for int(char) where char
# is a digit in any alphabet
digits = sorted(list(digits_mapping))
digits_starts = []
i = 0
while True:
    start = digits[i]
    digits_starts.append(start)
    for j in range(10):
        if digits_mapping[start + j] != j:
            print(start, start + j, digits_mapping[start + j])
    i += 10
    if i >= len(digits):
        break

casefold = {}
with open(os.path.join("ucd", "CaseFolding.txt")) as f:
    for line in f:
        if not line.strip() or line.startswith("#"):
            continue
        parts = [x.strip() for x in line.split(";")]
        status = parts[1]
        if status == "F" or status == "S":
            casefold[to_int(parts[0])] = [to_int(x) for x in
                parts[2].split()]

tables = {}

def add(char, key):
    if not key in tables:
        tables[key] = []
    sequence = tables[key]
    if not sequence:
        sequence.append(char)
    elif isinstance(sequence[-1], list):
        start, nb, step = sequence[-1]
        if char - (start + nb * step) == 0:
            sequence[-1][1] += 1
        else:
            sequence.append(char)
    elif len(sequence) < 2:
        sequence.append(char)
    else:
        if isinstance(sequence[-2], int):
            step = char - sequence[-1]
            if sequence[-1] - sequence[-2] == step:
                sequence[-2:] = [[sequence[-2], 3, step]]
            else:
                sequence.append(char)
        else:
            sequence.append(char)

# Only store the codepoints where isdigit() is True and category is 'No'
# and those where isnumeric() is True and category is 'Lo'
# Used in py_string.js in methods .isdigit() and .isnumeric()
for i in range(918000):
    if chr(i).isdigit():
        if unicodedata.category(chr(i)) == 'No':
            add(i, "No_digits")
    if chr(i).isnumeric():
        if unicodedata.category(chr(i)) == 'Lo':
            add(i, "Lo_numeric")

import json
data = {}
for cat in tables:
    data[cat] = []
    for item in tables[cat]:
        if isinstance(item, list) and item[2] == 1:
            data[cat].append(item[:2])
        else:
            data[cat].append(item)

with open(os.path.join(dest_dir, "unicode_data.js"), "w",
        encoding="utf-8") as out:
    out.write("// Generated by scripts/make_unicode_tables.py\n")
    out.write("var $B = __BRYTHON__\n")
    out.write("$B.unicode = ")
    json.dump(data, out, separators=[",", ":"])
    out.write('\n$B.digits_starts = ')
    json.dump(digits_starts, out, separators=[",", ":"])
    out.write("\n$B.unicode_casefold = " +
        str(casefold).replace(" ", ""))
    out.write("\n$B.unicode_bidi_whitespace = " +
        str(bidi_ws).replace(" ", ""))
