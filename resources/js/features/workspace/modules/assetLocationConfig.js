export const assetLocationConfig = {
    controls: [
        {
            id: 'assetType',
            type: 'select',
            value: 'asset',
            options: [{ value: 'asset', label: 'Aset' }],
            wrapperClassName: 'w-full sm:w-[220px]',
            className: 'w-full',
        },
        {
            id: 'keyword',
            type: 'search',
            value: '',
            placeholder: 'Cari/Pilih Aset...',
            wrapperClassName: 'min-w-0 flex-[999_1_320px] basis-full lg:basis-auto',
            className: 'w-full',
        },
        {
            id: 'entryDate',
            type: 'date',
            value: '30/04/2026',
            wrapperClassName: 'w-full sm:w-[230px]',
            className: 'w-full',
        },
    ],
    actions: [
        { id: 'reload', icon: 'link', label: 'Muat ulang aset per lokasi' },
        { id: 'open-linked', icon: 'external-link', label: 'Buka referensi aset per lokasi' },
    ],
    table: {
        columns: [
            { id: 'name', label: 'Nama', widthClassName: 'w-[250px]', align: 'center' },
            { id: 'address', label: 'Alamat', widthClassName: 'min-w-[760px]', align: 'center' },
            { id: 'quantity', label: 'Kuantitas', widthClassName: 'w-[150px]', align: 'center' },
        ],
        rows: [],
        emptyLabel: 'Belum ada data',
        emptySpaceClassName: 'min-h-[320px] sm:min-h-[420px] xl:min-h-[68vh]',
        tableClassName: 'min-w-[1180px]',
        searchKeys: ['name', 'address', 'quantity'],
    },
    sidePanel: {
        hidden: true,
    },
};
