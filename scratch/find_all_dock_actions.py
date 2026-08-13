import os

for root, dirs, files in os.walk(r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\js"):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if 'dockActions' in content or 'createDocumentDockAction' in content or 'renderDockActions' in content or 'actionsSlot' in content:
                    print(path)
                    for line in content.splitlines():
                        if 'dock' in line.lower() or 'action' in line.lower():
                            if any(k in line.lower() for k in ['create', 'dock', 'print', 'cetak', 'dokumen', 'delete', 'hapus', 'save', 'simpan']):
                                print("  ", line.strip()[:120])
