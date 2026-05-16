const PERIOD_MONTH_OPTIONS = [
    '[Pilih Bulan]',
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

export function getPeriodMonthOptions() {
    return PERIOD_MONTH_OPTIONS;
}

export function buildPeriodYearOptions(config, minimumYear = 2014) {
    const currentYear = new Date().getFullYear();
    const configuredYears = [
        ...(config.yearOptions ?? []),
        ...(config.historyTable?.filters?.[1]?.options ?? []).map((option) => option.value),
        ...(config.detailRecords ?? []).map((record) => record.year),
        config.defaults?.year,
        String(currentYear),
    ]
        .map((year) => Number.parseInt(String(year ?? ''), 10))
        .filter((year) => Number.isFinite(year));
    const maxYear = Math.max(currentYear, ...configuredYears);
    const minYear = Math.min(minimumYear, ...configuredYears);
    const yearOptions = [];

    for (let year = maxYear; year >= minYear; year -= 1) {
        yearOptions.push(String(year));
    }

    return yearOptions;
}
