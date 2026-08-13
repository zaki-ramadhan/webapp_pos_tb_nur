import os

for root, dirs, files in os.walk(r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\js"):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if 'Cetak' in content or 'Dokumen' in content or 'actionsSlot' in content:
                    for line in content.splitlines():
                        if 'DockActionButton' in line or ('label:' in line and ('Cetak' in line or 'Dokumen' in line or 'Print' in line or 'Proses' in line or 'Batal' in line or 'Salin' in line)):
                            if 'Dock' in line or 'actions' in line.lower() or 'button' in line.lower():
                                print(f"{path}: {line.strip()}")
