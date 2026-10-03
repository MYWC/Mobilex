export interface PaymentSession {
  provider: string;
  paymentId: string;
  amount: number;
  redirectUrl?: string;
  expiresAt?: string;
}

export interface PaymentProvider {
  createSession(input: {
    orderId: string;
    orderNumber: string;
    amount: number;
    callbackUrl: string;
  }): Promise<PaymentSession>;
}
