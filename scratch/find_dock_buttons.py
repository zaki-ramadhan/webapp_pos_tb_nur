import os

for root, dirs, files in os.walk(r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\js"):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if 'actionsSlot' in content or 'DockActionButton' in content or 'dockActions' in content:
                    print(path)
                    for line in content.splitlines():
                        if 'actionsSlot' in line or 'DockActionButton' in line:
                            print("  ", line.strip())
