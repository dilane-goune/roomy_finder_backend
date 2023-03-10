export type HTTPVERB = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type PaypalTransactionStatus =
  | "CREATED"
  | "SAVED"
  | "COMPLETED"
  | "APPROVED"
  | "VOIDED"
  | "PAYER_ACTION_REQUIRED";

export interface IPayPalCapture {
  "disbursement_mode": "INSTANT";
  "amount": {
    "currency_code": string;
    "value": string;
  };
  "seller_protection": {
    "status": string;
    "dispute_categories": string[];
  };
  "supplementary_data": {
    "related_ids": {
      "order_id": string;
    };
  };
  "update_time": string;
  "create_time": string;
  "final_capture": boolean;
  "seller_receivable_breakdown": {
    "gross_amount": {
      "currency_code": string;
      "value": string;
    };
    "paypal_fee": {
      "currency_code": string;
      "value": string;
    };
    "platform_fees": [
      {
        "amount": {
          "currency_code": string;
          "value": string;
        };
        "payee": {
          "merchant_id": string;
        };
      }
    ];
    "net_amount": {
      "currency_code": string;
      "value": string;
    };
  };
  "invoice_id": string;
  "links": {
    "href": string;
    "rel": string;
    "method": HTTPVERB;
  }[];
  "id": string;
  "status": "COMPLETED" | "CANCELLED" | "FAILED" | "PENDING";
}
export interface IPaypalPayout {
  "batch_header": {
    "payout_batch_id": string;
    "batch_status": string;
    "time_created": string;
    "time_completed": string;
    "sender_batch_header": {
      "sender_batch_id": string;
    };
    "amount": {
      "currency": string;
      "value": string;
    };
    "fees": {
      "currency": string;
      "value": string;
    };
    "payments": number;
  };
  "links": {
    "href": string;
    "rel": string;
    "method": string;
  }[];
}

export interface IPaypalPayoutItem {
  "payout_item_id": string;
  "transaction_id": string;
  "transaction_status": string;
  "payout_item_fee": {
    "currency": string;
    "value": string;
  };
  "payout_batch_id": string;
  "payout_item": {
    "recipient_type": string;
    "amount": {
      "currency": string;
      "value": string;
    };
    "note": string;
    "receiver": string;
    "sender_item_id": string;
  };
  "time_processed": string;
  "links": {
    "href": string;
    "rel": string;
    "method": string;
  }[];
}

export interface IPaypalWebHook {
  id: string;
  event_version: string;
  create_time: string;
  resource_type: string;
  event_type: PaypalHookName;
  summary: string;
  resource: object;
  links: {
    href: string;
    rel: string;
    method: string;
  }[];
}

export interface IOrderDetail {
  "id": string;
  "intent": "CAPTURE" | "AUTHORIZE";
  "status":
    | "CREATED"
    | "SAVED"
    | "COMPLETED"
    | "APPROVED"
    | "VOIDED"
    | "PAYER_ACTION_REQUIRED";
  "payment_source": {
    "paypal": {
      "email_address": string;
      "account_id": string;
      "name": {
        "given_name": string;
        "surname": string;
      };
      "address": {
        "country_code": string;
      };
    };
  };
  "purchase_units": {
    "payments": {
      "captures": {
        "id": string;
        "status":
          | "CREATED"
          | "SAVED"
          | "APPROVED"
          | "COMPLETED"
          | "VOIDED"
          | "PAYER_ACTION_REQUIRED";
        "amount": {
          "currency_code": string;
          "value": string;
        };
        "final_capture": boolean;
        "disbursement_mode": string;

        "seller_receivable_breakdown": {
          "gross_amount": {
            "currency_code": string;
            "value": string;
          };
          "paypal_fee": {
            "currency_code": string;
            "value": string;
          };
          "net_amount": {
            "currency_code": string;
            "value": string;
          };
        };
      }[];
    };
  }[];
}

export interface IOrderCapture {
  "id": string;
  "status": PaypalTransactionStatus;
  "purchase_units": {
    "reference_id": string;
    "shipping": {
      "name": {
        "full_name": string;
      };
      "address": {
        "address_line_1": string;
        "admin_area_2": string;
        "admin_area_1": string;
        "postal_code": string;
        "country_code": string;
      };
    };
    "payments": {
      "captures": {
        "id": string;
        "status": PaypalTransactionStatus;
        "amount": {
          "currency_code": string;
          "value": string;
        };
        "final_capture": boolean;
        "seller_protection": {
          "status": string;
          "dispute_categories": string[];
        };
        "seller_receivable_breakdown": {
          "gross_amount": {
            "currency_code": string;
            "value": string;
          };
          "paypal_fee": {
            "currency_code": string;
            "value": string;
          };
          "net_amount": {
            "currency_code": string;
            "value": string;
          };
        };
        "links": {
          "href": string;
          "rel": string;
          "method": HTTPVERB;
        }[];
        "create_time": string;
        "update_time": string;
      }[];
    };
  }[];

  "payer": {
    "name": {
      "given_name": string;
      "surname": string;
    };
    "email_address": string;
    "payer_id": string;
    "address": {
      "country_code": string;
    };
  };
  "links": {
    "href": string;
    "rel": string;
    "method": HTTPVERB;
  }[];
}

export type PaypalHookName =
  | "PAYMENT.PAYOUTS-ITEM.BLOCKED"
  | "PAYMENT.PAYOUTS-ITEM.BLOCKED"
  | "PAYMENT.PAYOUTS-ITEM.CANCELED"
  | "PAYMENT.PAYOUTS-ITEM.DENIED"
  | "PAYMENT.PAYOUTS-ITEM.FAILED"
  | "PAYMENT.PAYOUTS-ITEM.HELD"
  | "PAYMENT.PAYOUTS-ITEM.REFUNDED"
  | "PAYMENT.PAYOUTS-ITEM.RETURNED"
  | "PAYMENT.PAYOUTS-ITEM.SUCCEEDED"
  | "PAYMENT.PAYOUTS-ITEM.UNCLAIMED"
  | "PAYMENT.PAYOUTSBATCH.DENIED"
  | "PAYMENT.PAYOUTSBATCH.PROCESSING"
  | "PAYMENT.PAYOUTSBATCH.SUCCESS"
  | "PAYMENT.ORDER.CREATED"
  | "PAYMENT.ORDER.CANCELLED"
  | "PAYMENT.CAPTURE.REVERSED"
  | "PAYMENT.CAPTURE.REFUNDED"
  | "PAYMENT.CAPTURE.PENDING"
  | "PAYMENT.CAPTURE.DENIED"
  | "PAYMENT.CAPTURE.COMPLETED"
  | "PAYMENT.AUTHORIZATION.CREATED"
  | "PAYMENT.AUTHORIZATION.VOIDED"
  | "CHECKOUT.ORDER.APPROVED";
