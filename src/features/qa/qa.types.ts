export interface ProductQuestion { id:string; productId:string; userId?:string; userName?:string; question:string; answerCount:number; createdAt:string; }
export interface ProductAnswer { id:string; questionId:string; userId?:string; userName?:string; body:string; isOfficial:boolean; createdAt:string; }
