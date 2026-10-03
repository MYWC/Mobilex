export type TicketStatus='open'|'pending'|'resolved'|'closed';
export type TicketPriority='low'|'normal'|'high'|'urgent';
export interface SupportTicket { id:string; ticketNumber:string; subject:string; category:string; priority:TicketPriority; status:TicketStatus; createdAt:string; updatedAt:string; }
export interface SupportMessage { id:string; ticketId:string; body:string; senderType:'customer'|'agent'; createdAt:string; }
