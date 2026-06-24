const compactNumberFormatter = new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

function normalizeNumericString(value) {
    let normalizedValue = String(value ?? '')
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/rp|idr/g, '')
        .replace(/triliun/g, 't')
        .replace(/miliar/g, 'b')
        .replace(/juta/g, 'jt')
        .replace(/ribu/g, 'rb')
        .replace(/[^0-9,.\-a-z]/g, '');

    let multiplier = 1;

    if (normalizedValue.endsWith('jt')) {
        multiplier = 1_000_000;
        normalizedValue = normalizedValue.slice(0, -2);
    } else if (normalizedValue.endsWith('rb')) {
        multiplier = 1_000;
        normalizedValue = normalizedValue.slice(0, -2);
    } else if (normalizedValue.endsWith('b')) {
        multiplier = 1_000_000_000;
        normalizedValue = normalizedValue.slice(0, -1);
    } else if (normalizedValue.endsWith('t')) {
        multiplier = 1_000_000_000_000;
        normalizedValue = normalizedValue.slice(0, -1);
    }

    if (normalizedValue.includes('.') && normalizedValue.includes(',')) {
        normalizedValue = normalizedValue.replace(/\./g, '').replace(',', '.');
    } else if (normalizedValue.includes(',')) {
        const parts = normalizedValue.split(',');

        normalizedValue =
            parts.length === 2 && parts[1].length <= 2 ? normalizedValue.replace(',', '.') : normalizedValue.replace(/,/g, '');
    } else if (normalizedValue.includes('.')) {
        const parts = normalizedValue.split('.');

        normalizedValue =
            parts.length === 2 && parts[1].length <= 2 ? normalizedValue : normalizedValue.replace(/\./g, '');
    }

    return {
        multiplier,
        normalizedValue,
    };
}

export function parseDisplayNumber(value = 0) {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }

    const { multiplier, normalizedValue } = normalizeNumericString(value);
    const parsedValue = Number(normalizedValue);

    return Number.isFinite(parsedValue) ? parsedValue * multiplier : 0;
}

export function resolveCssVar(varName) {
    if (typeof window === 'undefined') return '';
    const match = String(varName).match(/var\((--[^)]+)\)/);
    if (match) {
        const propName = match[1];
        const val = getComputedStyle(document.documentElement).getPropertyValue(propName).trim();
        return val;
    }
    return varName;
}

export function resolveChartObject(obj) {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') {
        if (obj.startsWith('var(')) {
            const resolved = resolveCssVar(obj);
            if (resolved) return resolved;
        }
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(resolveChartObject);
    }
    if (typeof obj === 'object') {
        const result = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (typeof obj[key] === 'function') {
                    result[key] = obj[key];
                } else {
                    result[key] = resolveChartObject(obj[key]);
                }
            }
        }
        return result;
    }
    return obj;
}


export function toRgba(hexColor = 'var(--color-blue-55aef0)', alpha = 1) {
    let color = hexColor;
    if (typeof window !== 'undefined' && String(hexColor).startsWith('var(')) {
        const resolved = resolveCssVar(hexColor);
        if (resolved) {
            color = resolved;
        }
    }

    if (String(color).startsWith('rgb')) {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        if (match) {
            return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
        }
    }

    const normalizedHex = String(color).replace('#', '').trim();

    if (![3, 6].includes(normalizedHex.length)) {
        return `rgba(85, 174, 240, ${alpha})`;
    }

    const expandedHex =
        normalizedHex.length === 3
            ? normalizedHex
                  .split('')
                  .map((part) => `${part}${part}`)
                  .join('')
            : normalizedHex;

    const red = Number.parseInt(expandedHex.slice(0, 2), 16);
    const green = Number.parseInt(expandedHex.slice(2, 4), 16);
    const blue = Number.parseInt(expandedHex.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function formatChartValue(value = 0, format = 'number') {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return format === 'currency' ? 'Rp 0' : '0';
    }

    if (format === 'currency') {
        return `Rp ${compactNumberFormatter.format(numericValue)}`;
    }

    if (format === 'percent') {
        return `${numericValue.toLocaleString('id-ID', {
            maximumFractionDigits: 1,
        })}%`;
    }

    return compactNumberFormatter.format(numericValue);
}

export function hasNonZeroValue(values = []) {
    return values.some((value) => Math.abs(Number(value) || 0) > 0);
}

export function normalizeTrendSeries(series = [], accent = 'var(--color-blue-55aef0)') {
    const fallbackFill = toRgba(accent, 0.16);

    return (series ?? [])
        .filter((item) => Array.isArray(item?.data) && item.data.length)
        .map((item, index) => {
            const color = item.color ?? item.borderColor ?? (index === 0 ? accent : 'var(--color-tab-view-active-text)');

            return {
                label: item.label ?? `Seri ${index + 1}`,
                data: item.data.map((value) => Number(value) || 0),
                borderColor: color,
                backgroundColor: item.fillColor ?? toRgba(color, index === 0 ? 0.16 : 0.1) ?? fallbackFill,
            };
        });
}

export function normalizeBreakdownItems(items = []) {
    return (items ?? []).map((item, index) => {
        const numericValue = item.numericValue ?? item.amount ?? parseDisplayNumber(item.value ?? item.percent ?? 0);

        return {
            id: item.id ?? `${item.label ?? 'segment'}-${index}`,
            label: item.label ?? `Segmen ${index + 1}`,
            value: numericValue,
            valueText: item.value ?? formatChartValue(numericValue, 'currency'),
            percentText: item.percent ?? null,
            color: item.color ?? 'var(--color-table-border)',
        };
    });
}

export function normalizeSummarySections(sections = []) {
    return (sections ?? []).map((section, sectionIndex) => ({
        id: section.id ?? `${section.title ?? 'section'}-${sectionIndex}`,
        title: section.title ?? `Bagian ${sectionIndex + 1}`,
        items: (section.items ?? []).map((item, itemIndex) => {
            const numericValue = item.numericValue ?? item.amount ?? parseDisplayNumber(item.value ?? 0);

            return {
                id: item.id ?? `${item.label ?? 'item'}-${itemIndex}`,
                label: item.label ?? `Item ${itemIndex + 1}`,
                value: numericValue,
                valueText: item.value ?? formatChartValue(numericValue, 'currency'),
                color: item.color ?? 'var(--color-blue-94a3b8)',
            };
        }),
    }));
}

export function buildEmphasisColors(values = [], colors = [], mutedAlpha = 0.32) {
    const normalizedValues = values.map((value) => Number(value) || 0);
    const maxValue = normalizedValues.length ? Math.max(...normalizedValues) : 0;

    return normalizedValues.map((value, index) => {
        const baseColor = colors[index] ?? 'var(--color-blue-94a3b8)';

        if (maxValue <= 0 || value >= maxValue) {
            return baseColor;
        }

        return toRgba(baseColor, mutedAlpha);
    });
}

export function buildSingleHueEmphasisPalette(
    values = [],
    baseColor = 'var(--color-chart-accent)',
    {
        disabledColor = 'var(--color-chart-disabled)',
        hoverDisabledColor = 'var(--color-chart-disabled-hover)',
    } = {},
) {
    const normalizedValues = values.map((value) => Number(value) || 0);
    const maxValue = normalizedValues.length ? Math.max(...normalizedValues) : 0;

    if (maxValue <= 0) {
        return {
            backgroundColor: normalizedValues.map(() => disabledColor),
            hoverBackgroundColor: normalizedValues.map(() => hoverDisabledColor),
            borderColor: normalizedValues.map(() => disabledColor),
            hoverBorderColor: normalizedValues.map(() => hoverDisabledColor),
        };
    }

    return {
        backgroundColor: normalizedValues.map((value) => {
            if (value >= maxValue) {
                return baseColor;
            }

            return disabledColor;
        }),
        hoverBackgroundColor: normalizedValues.map((value) => {
            if (value >= maxValue) {
                return toRgba(baseColor, 0.88);
            }

            return hoverDisabledColor;
        }),
        borderColor: normalizedValues.map((value) => (value >= maxValue ? baseColor : disabledColor)),
        hoverBorderColor: normalizedValues.map((value) => (value >= maxValue ? baseColor : hoverDisabledColor)),
    };
}

export function buildRankedHuePalette(
    values = [],
    {
        primaryColor = 'var(--color-chart-accent)',
        secondaryColor = 'var(--color-chart-secondary)',
        tertiaryColor = 'var(--color-chart-tertiary)',
        hoverPrimaryColor = 'var(--color-blue-5f97de)',
        hoverSecondaryColor = 'var(--color-chart-secondary-hover)',
        hoverTertiaryColor = 'var(--color-chart-tertiary-hover)',
    } = {},
) {
    const normalizedValues = values.map((value, index) => ({
        index,
        value: Number(value) || 0,
    }));
    const rankedValues = [...normalizedValues].sort((left, right) => right.value - left.value);
    const rankByIndex = new Map();

    rankedValues.forEach((item, rank) => {
        rankByIndex.set(item.index, rank);
    });

    return {
        backgroundColor: normalizedValues.map((_, index) => {
            const rank = rankByIndex.get(index) ?? 2;

            if (rank === 0) {
                return primaryColor;
            }

            if (rank === 1) {
                return secondaryColor;
            }

            return tertiaryColor;
        }),
        hoverBackgroundColor: normalizedValues.map((_, index) => {
            const rank = rankByIndex.get(index) ?? 2;

            if (rank === 0) {
                return hoverPrimaryColor;
            }

            if (rank === 1) {
                return hoverSecondaryColor;
            }

            return hoverTertiaryColor;
        }),
        borderColor: normalizedValues.map((_, index) => {
            const rank = rankByIndex.get(index) ?? 2;

            if (rank === 0) {
                return primaryColor;
            }

            if (rank === 1) {
                return secondaryColor;
            }

            return tertiaryColor;
        }),
        hoverBorderColor: normalizedValues.map((_, index) => {
            const rank = rankByIndex.get(index) ?? 2;

            if (rank === 0) {
                return hoverPrimaryColor;
            }

            if (rank === 1) {
                return hoverSecondaryColor;
            }

            return hoverTertiaryColor;
        }),
    };
}
