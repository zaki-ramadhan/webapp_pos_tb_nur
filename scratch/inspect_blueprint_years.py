import os

files_to_check = [
    r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\app\Support\Presentation\Blueprints\Pages\PayrollEntryPage.php",
    r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\app\Support\Presentation\Blueprints\Pages\BankTransferPage.php",
    r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\app\Support\Presentation\Blueprints\Pages\CashPaymentPage.php",
    r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\app\Support\Presentation\Blueprints\Pages\CashReceiptPage.php",
    r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\app\Support\Presentation\Blueprints\Pages\ExpenseEntryPage.php",
    r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\app\Support\Presentation\Blueprints\Pages\GeneralJournalPage.php",
    r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\app\Support\Presentation\Blueprints\Pages\JournalActivityLogPage.php",
]

for filepath in files_to_check:
    if os.path.exists(filepath):
        print("=== " + filepath + " ===")
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            for i, line in enumerate(lines):
                if '2017' in line or '2016' in line:
                    print(f"L{i+1}: {line.strip()}")
