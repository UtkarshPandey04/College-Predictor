export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface College {
  id: string;
  name: string;
  shortName: string;
  location: string;
  state: string;
  type: string;
  rating: number;
  feesPerYear: number;
  avgPackage: number;
  highestPackage: number;
  placementRate: number;
  ranking: number;
  establishedYear: number;
  campusSize: string;
  totalStudents: number;
  facultyCount: number;
  naacGrade: string;
  hasHostel: boolean;
  hasSports: boolean;
  description: string;
  cutoff: string;
  website?: string;
  courses?: Course[];
  reviews?: Review[];
  placements?: PlacementStat[];
  recruiters?: Recruiter[];
  isSaved?: boolean;
}

export interface Course {
  id: string;
  name: string;
  duration: string;
  degree: string;
  seats?: number;
}

export interface Review {
  id: string;
  rating: number;
  text: string;
  pros?: string;
  cons?: string;
  batch?: string;
  createdAt: string;
  user: { name: string };
}

export interface PlacementStat {
  id: string;
  sector: string;
  percent: number;
}

export interface Recruiter {
  id: string;
  name: string;
  tier: string;
}

export interface CollegeFilters {
  search?: string;
  type?: string;
  state?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedColleges {
  colleges: College[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  name: string;
}
