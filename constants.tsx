import React from 'react';
import { Role } from './types';

export const ROLE_DISPLAY_NAMES: { [key in Role]: string } = {
  [Role.ADMIN]: 'Admin',
  [Role.LOAN_OFFICER]: 'Loan Officer',
  [Role.BORROWER]: 'User',
};

export function UserIcon(props: React.SVGProps<SVGSVGElement>): React.ReactNode {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

export const SIDENAV_LINKS = {
  [Role.BORROWER]: [
    { name: 'Dashboard', path: '/app/borrower/dashboard', icon: <HomeIcon /> },
    { name: 'Profile & Settings', path: '/app/profile', icon: <UserIcon /> },
    { name: 'Apply for Loan', path: '/app/borrower/apply', icon: <FilePlusIcon /> },
    { name: 'Loan Status', path: '/app/borrower/status', icon: <FileClockIcon /> },
    { name: 'Loan History', path: '/app/borrower/history', icon: <HistoryIcon /> },
  ],
  [Role.LOAN_OFFICER]: [
    { name: 'Dashboard', path: '/app/officer/dashboard', icon: <HomeIcon /> },
    { name: 'Profile & Settings', path: '/app/profile', icon: <UserIcon /> },
    { name: 'SMS Center', path: '/app/officer/sms-center', icon: <MessageSquareIcon /> },
    { name: 'Loan History', path: '/app/officer/history', icon: <HistoryIcon /> },
  ],
  [Role.ADMIN]: [
    { name: 'Dashboard', path: '/app/admin/dashboard', icon: <HomeIcon /> },
    { name: 'Profile & Settings', path: '/app/profile', icon: <UserIcon /> },
    { name: 'User Management', path: '/app/admin/users', icon: <UsersIcon /> },
    { name: 'Loan History', path: '/app/admin/loan-history', icon: <BanknoteIcon /> },
    { name: 'SMS Management', path: '/app/admin/sms-management', icon: <MessageSquareIcon /> },
  ],
};


export function HomeIcon(props: React.SVGProps<SVGSVGElement>): React.ReactNode {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function FilePlusIcon(props: React.SVGProps<SVGSVGElement>): React.ReactNode {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" x2="12" y1="18" y2="12" />
      <line x1="9" x2="15" y1="15" y2="15" />
    </svg>
  );
}

export function FileClockIcon(props: React.SVGProps<SVGSVGElement>): React.ReactNode {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <circle cx="12" cy="14" r="4" />
      <path d="M12 12v2h2" />
    </svg>
  );
}

export function UsersIcon(props: React.SVGProps<SVGSVGElement>): React.ReactNode {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function BanknoteIcon(props: React.SVGProps<SVGSVGElement>): React.ReactNode {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="12" x="2" y="6" rx="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    );
}

export function MessageSquareIcon(props: React.SVGProps<SVGSVGElement>): React.ReactNode {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}

export function LogOutIcon(props: React.SVGProps<SVGSVGElement>): React.ReactNode {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
        </svg>
    );
}

export function BuildingIcon(props: React.SVGProps<SVGSVGElement>): React.ReactNode {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" /><path d="M8 6h.01" />
            <path d="M16 6h.01" /><path d="M12 6h.01" />
            <path d="M12 10h.01" /><path d="M12 14h.01" />
            <path d="M16 10h.01" /><path d="M16 14h.01" />
            <path d="M8 10h.01" /><path d="M8 14h.01" />
        </svg>
    );
}

export function HistoryIcon(props: React.SVGProps<SVGSVGElement>): React.ReactNode {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
        </svg>
    );
}