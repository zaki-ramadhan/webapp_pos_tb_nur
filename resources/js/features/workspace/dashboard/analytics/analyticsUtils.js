export function parsePercentValue(value = '0%') {
    const normalizedValue = String(value).replace('%', '').replace(',', '.').trim();
    const parsedValue = Number(normalizedValue);

    return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function formatCompactLabel(value = '') {
    const normalizedValue = String(value).trim();

    if (normalizedValue.length <= 36) {
        return normalizedValue;
    }

    return `${normalizedValue.slice(0, 36)}...`;
}

export function getMetric(metrics, label) {
    return (metrics ?? []).find((item) => item.label === label) ?? null;
}

export function getProductImageUrl(name, size = 120) {
    const lowerName = String(name ?? '').toLowerCase();
    
    if (lowerName.includes('semen') || lowerName.includes('cement') || lowerName.includes('portland') || lowerName.includes('mu-')) {
        return `https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=${size}&h=${size}&fit=crop&q=80`;
    }
    if (lowerName.includes('cat') || lowerName.includes('paint') || lowerName.includes('nippon') || lowerName.includes('dulux') || lowerName.includes('kuas')) {
        return `https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=${size}&h=${size}&fit=crop&q=80`;
    }
    if (lowerName.includes('kayu') || lowerName.includes('triplek') || lowerName.includes('papan') || lowerName.includes('lumber') || lowerName.includes('balok')) {
        return `https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=${size}&h=${size}&fit=crop&q=80`;
    }
    if (lowerName.includes('besi') || lowerName.includes('baja') || lowerName.includes('seng') || lowerName.includes('paku') || lowerName.includes('kawat') || lowerName.includes('rebar')) {
        return `https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=${size}&h=${size}&fit=crop&q=80`;
    }
    if (lowerName.includes('bata') || lowerName.includes('batako') || lowerName.includes('roster') || lowerName.includes('paving') || lowerName.includes('brick')) {
        return `https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=${size}&h=${size}&fit=crop&q=80`;
    }
    if (lowerName.includes('pipa') || lowerName.includes('pvc') || lowerName.includes('selang') || lowerName.includes('kran') || lowerName.includes('fitting')) {
        return `https://images.unsplash.com/photo-1542013936693-8848e574047a?w=${size}&h=${size}&fit=crop&q=80`;
    }
    if (lowerName.includes('palu') || lowerName.includes('obeng') || lowerName.includes('tang') || lowerName.includes('meteran') || lowerName.includes('gergaji') || lowerName.includes('alat') || lowerName.includes('tool')) {
        return `https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=${size}&h=${size}&fit=crop&q=80`;
    }
    if (lowerName.includes('genteng') || lowerName.includes('seng') || lowerName.includes('asbes') || lowerName.includes('atap')) {
        return `https://images.unsplash.com/photo-1632759162444-1107ffa59790?w=${size}&h=${size}&fit=crop&q=80`;
    }
    if (lowerName.includes('pasir') || lowerName.includes('batu') || lowerName.includes('kerikil') || lowerName.includes('seplit')) {
        return `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=${size}&h=${size}&fit=crop&q=80`;
    }
    
    return `https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=${size}&h=${size}&fit=crop&q=80`;
}
