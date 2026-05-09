import {
    resolveBusinessPartnerConfig,
    resolveBusinessPartnerRecord,
} from '@/features/workspace/modules/business-partner/businessPartnerConfigCore';
import { customerBusinessPartnerTemplate } from '@/features/workspace/modules/business-partner/customerBusinessPartnerConfig';
import { supplierBusinessPartnerTemplate } from '@/features/workspace/modules/business-partner/supplierBusinessPartnerConfig';

const templates = {
    customer: customerBusinessPartnerTemplate,
    supplier: supplierBusinessPartnerTemplate,
};

export function buildBusinessPartnerConfig(kind, pageConfig = {}) {
    return resolveBusinessPartnerConfig(kind, pageConfig, templates);
}

export function buildBusinessPartnerRecord(kind, row = {}, config) {
    return resolveBusinessPartnerRecord(kind, row, config, templates);
}
