export interface Member {
  user_id: string;
  password?: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
}

export interface LoginMemberRequest {
  user_id: string;
  password: string;
}

// Keep old interfaces for backward compatibility
export interface MemberInterface {
  user_id: number;
  first_name: string;
  last_name: string;
  password: string;
  email: string;
}
