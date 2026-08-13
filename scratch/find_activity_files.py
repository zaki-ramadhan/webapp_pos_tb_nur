import os

for root, dirs, files in os.walk(r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp"):
    for file in files:
        if file.endswith('.php') or file.endswith('.jsx'):
            if 'activity' in file.lower() or 'dashboard' in file.lower():
                print(os.path.join(root, file))
