export interface PromotionCampaign {
  id: string;
  slug: string;
  titleFa: string;
  titleEn?: string;
  descriptionFa?: string;
  descriptionEn?: string;
  badge?: string;
  startsAt: string;
  endsAt: string;
  discountPercent?: number;
  couponCode?: string;
  imageUrl?: string;
  active: boolean;
}
