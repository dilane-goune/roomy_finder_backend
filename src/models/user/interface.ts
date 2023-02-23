export interface User {
  id: string;
  type: "landlord" | "tenant" | "roommate" | "freelancer";
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
  country: string;
  gender: "Male" | "Female";
  profilePicture?: string;
  fcmToken: string;
  isPremium: boolean;
  isDisabled: boolean;
  failedToLoginCount: number;
  bankInfo?: {
    name: string;
    accountNumber: string;
    accountHolderName: string;
    iban: string;
    swiftCode: string;
  };
  readonly createdAt: Date;
}

export interface UserMethods {}
