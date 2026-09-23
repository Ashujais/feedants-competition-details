export type Winner = { name: string; position: string; imageUrl: string; videoUrl?: string };
export type Reward = { position: number; label: string; amount: number };

export type Competition = {
  _id: string;
  title: string;
  category: string;
  badges: string[];
  description: string;
  prizePool: number;
  entryFee: number;
  maxParticipants: number;
  registrationStart: string;
  registrationEnd: string;
  submissionStart: string;
  submissionEnd: string;
  resultDate: string;
  certificateText: string;
  lifecycle: string;
  judge: { name: string; title: string; experience: string; imageUrl: string; videoUrl: string };
  previousWinners: Winner[];
  content: { about: string; judgingParameters: string[]; rules: string[]; eligibility: string[] };
  rewards: Reward[];
  referral: { url: string; earningText: string };
  paymentInfo: { prizeDelivery: string; refundPolicy: string; provider: string; explainerVideoUrl: string };
  reviews: { name: string; quote: string; rating: number }[];
  availability: { registeredCount: number; remainingSpots: number; isFull: boolean };
  userState: {
    isRegistered: boolean;
    participationStatus: string;
    submissionStatus: string;
    registrationAllowed: boolean;
    submissionAllowed: boolean;
  };
  serverTime: string;
};
