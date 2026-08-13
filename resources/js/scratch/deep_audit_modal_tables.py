import os
import re

base_dir = r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\js"

modal_table_audits = []

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            is_modal = 'Modal' in file or 'Dialog' in file or 'WorkspaceDialog' in content or 'ModalBase' in content
            has_table = 'DataTable' in content or '<table' in content or '<tr' in content
            
            if is_modal and has_table:
                rel_path = os.path.relpath(path, base_dir)
                uses_core_datatable = 'DataTable' in content
                uses_workspace_dialog = 'WorkspaceDialog' in content
                uses_raw_html_table = '<table' in content
                
                modal_table_audits.append({
                    'file': rel_path,
                    'uses_workspace_dialog': uses_workspace_dialog,
                    'uses_core_datatable': uses_core_datatable,
                    'uses_raw_html_table': uses_raw_html_table,
                })

print(f"Total Modal Component Files Audited: {len(modal_table_audits)}")
print("=" * 70)
for item in modal_table_audits:
    print(f"File: {item['file']}")
    print(f"   - Shell Component: {'WorkspaceDialog (Standard)' if item['uses_workspace_dialog'] else 'ModalBase / Custom Modal'}")
    print(f"   - Table Component: {'DataTable (Core Standard)' if item['uses_core_datatable'] else ('Raw HTML <table>' if item['uses_raw_html_table'] else 'No direct table tags')}")
    print("-" * 70)
