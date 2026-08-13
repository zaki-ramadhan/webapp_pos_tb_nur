import os, re

modules_dir = r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\js"

pattern = re.compile(r"\{\s*id:\s*['\"]([^'\"]+)['\"],\s*label:\s*['\"](['\"]*)\s*['\"]", re.MULTILINE)

found = []
for root, dirs, files in os.walk(modules_dir):
    for f in files:
        if f.endswith('.js') or f.endswith('.jsx'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
                content = file.read()
                for match in pattern.finditer(content):
                    col_id, label = match.group(1), match.group(2)
                    if label == '' or label == '""' or label == "''":
                        found.append((f, col_id, filepath))

print(f"Found {len(found)} empty column labels:")
for f, col_id, path in found:
    print(f"  File: {f} | Column ID: {col_id} | Path: {path}")
