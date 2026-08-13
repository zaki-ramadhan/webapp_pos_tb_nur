import os
import re

base_dir = r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\js\features\workspace\modules"

results = []

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            rel_path = os.path.relpath(filepath, base_dir)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Find all component-like function declarations or const definitions
            funcs = re.findall(r'^(?:export\s+)?(?:default\s+)?function\s+([A-Z][A-Za-z0-9_]*)', content, re.MULTILINE)
            consts = re.findall(r'^(?:export\s+)?(?:default\s+)?const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>', content, re.MULTILINE)
            
            all_comps = list(set(funcs + consts))
            if len(all_comps) > 1:
                results.append((rel_path, len(all_comps), sorted(all_comps)))

print(f"Found {len(results)} files with multiple components in a single file:\n")
for rel_path, count, comps in sorted(results, key=lambda x: x[1], reverse=True):
    print(f"- {rel_path} ({count} components): {', '.join(comps)}")
