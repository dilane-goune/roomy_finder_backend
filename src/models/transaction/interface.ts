export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  object:
    | "PAY_POST_PROPERTY_AD"
    | "UPGRADE_TO_PREMIUM"
    | "PAY_PROPERTY_RENT"
    | "LANDLORD_WITHDRAW";
  service: "STRIPE" | "PAYPAL";
  action: "PAYMENT" | "PAYOUT";
  status: "completed" | "pending" | "failed";
  userId: string; // The user which is doing the operation

  objectId: string; // can be id of property,user,roommatead

  createdAt: Date;
  // Required if service is STRIPE
  stripeData?: {
    paymentIntentId?: string; // Use for stripe payments
    checkoutSessionId?: string; // Use for stripe payments
  };
  // Required if service is PAYPAL
  paypalData?: {
    transactionId?: string; // Use for stripe payments
  };
  extra: { [key: string]: any };
}

export interface TransactionMetthods {}
