export type Profile = {
  id: string;
  nickname: string;
  centerName: string;
  stayYearMonth: string;
  region: string;
  babyBirthMonth?: string;
  bio: string;
  contactHint?: string;
  createdAt: string;
};

export type View = "home" | "profile" | "discover";
