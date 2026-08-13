with open(r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\app\Support\Presentation\Queries\DashboardAnalyticsQueryService.php", 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if 'activity' in line.lower():
            print(f"{i+1}: {line.strip()}")
