import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';
import { sanitizeTextValue } from '@/utils/textSanitizer';

export function unformatAmount(val) {
    if (val === null || val === undefined) return '';
    if (typeof val === 'number') return val;
    let str = String(val);
    let clean = str.replace(/\./g, '').replace(/,/g, '.');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? str : parsed;
}

export function sanitizeInput(val, type, id = '', name = '', placeholder = '', prefix = '', lettersOnly = false, options = {}) {
    if (typeof val !== 'string') return val;

    val = sanitizeTextValue(val);

    if (val.startsWith(' ')) {
        val = val.trimStart();
    }
    val = val.replace(/[ \t]{2,}/g, ' ');

    const prefixStr = typeof prefix === 'string' ? prefix.toLowerCase() : '';
    const searchStr = `${id} ${name} ${placeholder} ${prefixStr}`.toLowerCase();

    const isPostal = options.isPostal ?? (
        searchStr.includes('postal') ||
        searchStr.includes('kodepos') ||
        searchStr.includes('zip') ||
        searchStr.includes('k.pos') ||
        searchStr.includes('kode pos')
    );

    const isPhone = options.isPhone ?? (
        searchStr.includes('phone') ||
        searchStr.includes('telp') ||
        searchStr.includes('telepon') ||
        searchStr.includes('whatsapp') ||
        searchStr.includes('wa') ||
        searchStr.includes('fax') ||
        searchStr.includes('hp') ||
        searchStr.includes('kontak') ||
        searchStr.includes('contact')
    );

    const isCurrency = options.isCurrency ?? (
        searchStr.includes('price') ||
        searchStr.includes('amount') ||
        searchStr.includes('limit') ||
        searchStr.includes('kurs') ||
        searchStr.includes('jumlah') ||
        searchStr.includes('nominal') ||
        searchStr.includes('cost') ||
        searchStr.includes('piutang') ||
        searchStr.includes('utang') ||
        searchStr.includes('nilai') ||
        searchStr.includes('length') ||
        searchStr.includes('width') ||
        searchStr.includes('height') ||
        searchStr.includes('weight') ||
        searchStr.includes('panjang') ||
        searchStr.includes('lebar') ||
        searchStr.includes('tinggi') ||
        searchStr.includes('berat') ||
        searchStr.includes('qty') ||
        searchStr.includes('quantity') ||
        searchStr.includes('kuantitas') ||
        prefixStr === 'rp'
    );

    const isNpwp = options.isNpwp ?? (
        searchStr.includes('npwp') ||
        searchStr.includes('tax_number') ||
        searchStr.includes('taxnumber')
    );

    const isBankAccount = options.isBankAccount ?? (
        searchStr.includes('account_number') ||
        searchStr.includes('accountnumber') ||
        searchStr.includes('rekening') ||
        searchStr.includes('norek') ||
        searchStr.includes('no_rek') ||
        searchStr.includes('no.rek') ||
        searchStr.includes('bank_account') ||
        searchStr.includes('bankaccount')
    );

    if (isCurrency) {
        return formatAmountInput(val, {
            allowDecimal: options.allowDecimal ?? true,
            allowNegative: options.allowNegative ?? false,
            isInput: true
        });
    }

    if (isBankAccount) {
        return val.replace(/[^0-9]/g, '').slice(0, 30);
    }

    if (isNpwp) {
        return val.replace(/[^0-9.-]/g, '').slice(0, 20);
    }

    if (isPostal) {
        return val.replace(/[^0-9]/g, '').slice(0, 5);
    }

    if (isPhone) {
        return val.replace(/[^0-9+\-\s()]/g, '');
    }

    if (type === 'number' || options.numericOnly) {
        return val.replace(/[^0-9]/g, '');
    }

    if (lettersOnly || options.lettersOnly) {
        return val.replace(/[^a-zA-Z\s'.-]/g, '');
    }

    return val;
}

export function isClearOrCloseElement(element) {
    if (!element) return false;
    if (typeof element === 'object' && element.type) {
        const typeName = element.type.name || (element.type.render && element.type.render.name) || '';
        if (typeName === 'CloseIcon' || typeName === 'Close') {
            return true;
        }
        if (element.props) {
            if (element.props.className && element.props.className.includes('CloseIcon')) {
                return true;
            }
            if (element.props['aria-label'] && /close|clear|hapus/i.test(element.props['aria-label'])) {
                return true;
            }
            const children = element.props.children;
            if (typeof children === 'string' && (children === 'x' || children === '×')) {
                return true;
            }
        }
    }
    return false;
}
