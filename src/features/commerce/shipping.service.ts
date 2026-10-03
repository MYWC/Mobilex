import type { ShippingMethod } from './commerce.types';
import { SHIPPING_OPTIONS } from './commerce.constants';
export const getShippingOption = (id: ShippingMethod) =>
  SHIPPING_OPTIONS.find((x) => x.id === id) ?? SHIPPING_OPTIONS[0];
export function getEtaLabel(id: ShippingMethod, locale: 'fa' | 'en') {
  const o = getShippingOption(id);
  if (locale === 'en')
    return o.etaMinDays === 0 ? 'Same/next day pickup' : `${o.etaMinDays}-${o.etaMaxDays} business days`;
  return o.etaMinDays === 0 ? 'همان روز / روز بعد' : `${o.etaMinDays} تا ${o.etaMaxDays} روز کاری`;
}
