export function exportToCSV(columns, rows, filename = 'export') {
    const activeColumns = columns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions');
    const header = activeColumns.map(col => `"${String(col.label || '').replace(/"/g, '""')}"`).join(',');
    
    const body = rows.map(row => 
        activeColumns.map(col => {
            const val = row[col.id] !== undefined && row[col.id] !== null ? row[col.id] : '';
            const valStr = Array.isArray(val) ? val.join(', ') : String(val);
            return `"${valStr.replace(/"/g, '""')}"`;
        }).join(',')
    ).join('\n');
    
    const csvContent = '\uFEFF' + [header, body].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function exportToExcelXML(columns, rows, filename = 'export') {
    const activeColumns = columns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions');
    
    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Sheet1">
  <Table>`;

    xml += '\n   <Row>';
    activeColumns.forEach(col => {
        const text = String(col.label || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        xml += `\n    <Cell><Data ss:Type="String">${text}</Data></Cell>`;
    });
    xml += '\n   </Row>';

    rows.forEach(row => {
        xml += '\n   <Row>';
        activeColumns.forEach(col => {
            const val = row[col.id] !== undefined && row[col.id] !== null ? row[col.id] : '';
            const valStr = Array.isArray(val) ? val.join(', ') : String(val);
            const isNum = typeof val === 'number' && !isNaN(val);
            const type = isNum ? 'Number' : 'String';
            const text = valStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            xml += `\n    <Cell><Data ss:Type="${type}">${text}</Data></Cell>`;
        });
        xml += '\n   </Row>';
    });

    xml += `\n  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xls`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
