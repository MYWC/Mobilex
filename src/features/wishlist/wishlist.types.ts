export interface WishlistItemRecord {
  id: string;
  productId: string;
  createdAt: string;
}

export interface WishlistSyncResult {
  ids: string[];
  addedToCloud: number;
  removedFromCloud: number;
}
