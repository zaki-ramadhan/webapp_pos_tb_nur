# Domain Structure

Folder `app/Domain` dipakai untuk bounded context backend:

- `Catalog`
- `Inventory`
- `Purchasing`
- `Sales`
- `Finance`
- `Identity`
- `Organization`
- `Partner`
- `Support`

Setiap domain sudah disiapkan dengan subfolder `Actions`, `Data`, `Enums`, `Models`, `Queries`, dan `Services` agar business logic tidak menumpuk di controller.
