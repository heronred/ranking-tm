export type Category = "Federados" | "Não federados" | "Sub 11" | "60+";

export type UserRole = "admin" | "player";

export interface UserProfile {
  uid: string;
  displayName: string;
  nickname?: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  isApproved: boolean;
  category: Category;
  rankingPoints: number;
  createdAt: string;
  athleteId?: string;
  linkedAthleteId?: string;
}

export interface Athlete {
  id: string;
  name: string;
  category: Category;
  rankingPoints: number;
  linkedUserId?: string;
  linkedEmail?: string;
  createdAt: string;
}

export type TournamentStatus = "scheduled" | "ongoing" | "finished";

export interface Tournament {
  id: string;
  name: string;
  description: string;
  category?: Category;
  startDate: string;
  status: TournamentStatus;
  isActive: boolean;
  winnerId?: string;
  createdAt: string;
}

export type MatchStatus = "scheduled" | "ongoing" | "finished";
export type MatchType = "tournament" | "challenge";

export interface Match {
  id?: string;
  tournamentId?: string;
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  status: MatchStatus;
  winnerId?: string;
  type: MatchType;
  category: Category;
  date: string;
  updatedAt: string;
  finishedAt?: string;
  challengeId?: string;
}

export type ChallengeStatus = "pending" | "accepted" | "declined" | "completed";

export interface Challenge {
  id?: string;
  challengerId: string;
  challengerName: string;
  challengedId: string;
  challengedName: string;
  status: ChallengeStatus;
  category: Category;
  createdAt: string;
  matchId?: string;
}

export interface PointsLog {
  id: string;
  targetId: string;
  targetName: string;
  targetType: 'user' | 'athlete';
  previousPoints: number;
  newPoints: number;
  difference: number;
  reason: string;
  adminId: string;
  adminName: string;
  createdAt: string;
}
