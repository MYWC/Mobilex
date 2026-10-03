export type LoyaltyTier = 'starter'|'silver'|'gold'|'platinum';
export interface LoyaltyAccount { userId:string; points:number; lifetimePoints:number; tier:LoyaltyTier; nextTierPoints:number; progress:number; }
export interface LoyaltyTransaction { id:string; type:'earn'|'redeem'|'adjust'; points:number; description:string; createdAt:string; }
