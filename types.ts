export enum Role {
  BORROWER = 'BORROWER',
  LOAN_OFFICER = 'LOAN_OFFICER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  userIdNumber: string; // New user identifier
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  phone?: string;
  bvn?: string;
  nin?: string;
  pictureIdUrl?: string;
  isFrozen?: boolean;
}

export enum LoanStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export interface Loan {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  duration: number; // in months
  purpose: string;
  guarantorIds: string[]; // Changed from guarantor: string
  status: LoanStatus;
  applicationDate: string;
  approvalDate?: string;
}

export enum RepaymentStatus {
    PAID = 'PAID',
    UPCOMING = 'UPCOMING',
    OVERDUE = 'OVERDUE',
}

export interface Repayment {
  id: string;
  loanId: string;
  installment: number;
  amount: number;
  dueDate: string;
  status: RepaymentStatus;
}

export interface SmsLog {
    id: string;
    loanId: string;
    userName: string;
    message: string;
    date: string; // The date it was sent or is scheduled to be sent
    status: 'SENT' | 'FAILED' | 'SCHEDULED';
}