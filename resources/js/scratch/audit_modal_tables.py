import os
import re

base_dir = r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\js"

modal_files = []

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            # Check if file has both Modal/Dialog AND Table/DataTable
            has_modal = ('WorkspaceDialog' in content or 'ModalBase' in content or 'Modal' in file or 'Dialog' in file)
            has_table = ('DataTable' in content or 'table' in content.lower())
            
            if has_modal and has_table:
                modal_files.append((path, file))

print(f"Total Modal Files with Tables: {len(modal_files)}")
print("=" * 60)

for path, file in modal_files:
    rel_path = os.path.relpath(path, base_dir)
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        
    uses_data_table = 'DataTable' in content
    uses_trans_data_table = 'TransactionDataTable' in content
    uses_workspace_dialog = 'WorkspaceDialog' in content
    
    print(f"File: {rel_path}")
    print(f"  - Uses WorkspaceDialog: {uses_workspace_dialog}")
    print(f"  - Uses DataTable (Core Component): {uses_data_table}")
    print(f"  - Uses TransactionDataTable: {uses_trans_data_table}")
    print("-" * 60)
