export interface ProductReview {
  id: string;
  productId: string;
  userId?: string;
  userName?: string;
  rating: number;
  title?: string;
  body: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}
export interface ReviewSummary { average: number; count: number; distribution: Record<1|2|3|4|5, number>; }
