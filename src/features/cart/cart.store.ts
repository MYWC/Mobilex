import { create } from 'zustand';
import { z } from 'zod';
import type { CartLine, CartValidationIssue } from './cart.types';
import { COMMERCE } from '@/features/commerce/commerce.constants';
import { EVENTS, STORAGE_KEYS } from '@/app/config/constants';
import { readValidatedStorage, writeStorage } from '@/lib/storage/storage';
import { emit } from '@/lib/events/bus';

const schema = z
  .array(
    z.object({
      cartKey: z.string().min(1).max(256),
      id: z.string().min(1),
      variantId: z.string().nullable().optional(),
      variantLabel: z.string().optional(),
      name_fa: z.string().optional(),
      name_en: z.string().optional(),
      slug: z.string().optional(),
      price: z.number().finite().nonnegative(),
      compareAtPrice: z.number().finite().nonnegative().optional(),
      quantity: z.number().int().positive().max(COMMERCE.maxQuantityPerLine),
      image: z.string().optional(),
      maxQuantity: z.number().int().positive().max(COMMERCE.maxQuantityPerLine).optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    }),
  )
  .max(COMMERCE.maxCartLines);

interface CartState {
  items: CartLine[];
  selected: string[];
  issues: CartValidationIssue[];
  hydrated: boolean;
  hydrate: () => void;
  add: (item: CartLine) => void;
  remove: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  setSelected: (cartKey: string, selected: boolean) => void;
  selectAll: (selected: boolean) => void;
  clear: () => void;
  removeSelected: () => void;
  clearIssues: () => void;
  setIssues: (issues: CartValidationIssue[]) => void;
  count: () => number;
  subtotal: () => number;
  savings: () => number;
}

const clampQuantity = (item: CartLine, requested: number): number =>
  Math.max(
    1,
    Math.min(
      COMMERCE.maxQuantityPerLine,
      item.maxQuantity ?? COMMERCE.maxQuantityPerLine,
      Math.round(requested),
    ),
  );

const persist = (items: CartLine[]): void => {
  writeStorage(STORAGE_KEYS.cart, items);
  emit(EVENTS.cartChanged, { items, count: items.reduce((sum, item) => sum + item.quantity, 0) });
};

const normalizedKey = (item: CartLine): string => item.cartKey || `${item.id}:${item.variantId ?? 'default'}`;

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  selected: [],
  issues: [],
  hydrated: false,

  hydrate: () => {
    const stored = readValidatedStorage(STORAGE_KEYS.cart, schema, []) as CartLine[];
    const deduped = new Map<string, CartLine>();
    for (const raw of stored) {
      const key = normalizedKey(raw);
      const existing = deduped.get(key);
      if (existing) {
        existing.quantity = clampQuantity(existing, existing.quantity + raw.quantity);
      } else {
        deduped.set(key, { ...raw, cartKey: key, quantity: clampQuantity(raw, raw.quantity) });
      }
    }
    const items = [...deduped.values()];
    set({ items, selected: items.map((item) => item.cartKey), hydrated: true });
    persist(items);
  },

  add: (incoming) => {
    const item = { ...incoming, cartKey: normalizedKey(incoming) };
    const current = [...get().items];
    const existing = current.find((x) => x.cartKey === item.cartKey);
    if (existing) {
      existing.quantity = clampQuantity(existing, existing.quantity + item.quantity);
      existing.price = item.price;
      existing.compareAtPrice = item.compareAtPrice ?? existing.compareAtPrice;
      existing.maxQuantity = item.maxQuantity ?? existing.maxQuantity;
      existing.image = item.image ?? existing.image;
      existing.metadata = item.metadata ?? existing.metadata;
    } else if (current.length < COMMERCE.maxCartLines) {
      current.push({ ...item, quantity: clampQuantity(item, item.quantity) });
    } else {
      return;
    }
    persist(current);
    set({ items: current, selected: [...new Set([...get().selected, item.cartKey])] });
  },

  remove: (cartKey) => {
    const items = get().items.filter((item) => item.cartKey !== cartKey);
    persist(items);
    set({
      items,
      selected: get().selected.filter((key) => key !== cartKey),
      issues: get().issues.filter((issue) => issue.cartKey !== cartKey),
    });
  },

  updateQuantity: (cartKey, quantity) => {
    const item = get().items.find((x) => x.cartKey === cartKey);
    if (!item) return;
    const items = get().items.map((x) =>
      x.cartKey === cartKey ? { ...x, quantity: clampQuantity(x, quantity) } : x,
    );
    persist(items);
    set({ items });
  },

  setSelected: (cartKey, selected) =>
    set({
      selected: selected
        ? [...new Set([...get().selected, cartKey])]
        : get().selected.filter((key) => key !== cartKey),
    }),

  selectAll: (selected) => set({ selected: selected ? get().items.map((item) => item.cartKey) : [] }),

  clear: () => {
    persist([]);
    set({ items: [], selected: [], issues: [] });
  },

  removeSelected: () => {
    const keys = new Set(get().selected);
    const items = get().items.filter((item) => !keys.has(item.cartKey));
    persist(items);
    set({ items, selected: [], issues: get().issues.filter((issue) => !keys.has(issue.cartKey)) });
  },

  clearIssues: () => set({ issues: [] }),
  setIssues: (issues) => set({ issues }),
  count: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  subtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  savings: () =>
    get().items.reduce(
      (sum, item) => sum + Math.max(0, (item.compareAtPrice ?? item.price) - item.price) * item.quantity,
      0,
    ),
}));
