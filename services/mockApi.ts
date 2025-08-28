
import { User, Role, Loan, LoanStatus, Repayment, RepaymentStatus, SmsLog } from '../types';

// Helper to generate IDs
const uuid = () => crypto.randomUUID();
const formatUserId = (num: number) => `PMB-${String(num).padStart(5, '0')}`;

// --- MOCK DATABASE ---

let users: User[] = [
    { id: 'user-1', userIdNumber: formatUserId(1), name: 'John Doe', email: 'johndoe@example.com', role: Role.BORROWER, phone: '08012345678', bvn: '12345678901', nin: '123456789012345', isFrozen: false },
    { id: 'user-2', userIdNumber: formatUserId(2), name: 'Adebayo Officer', email: 'officer.ade@perfectbank.com', role: Role.LOAN_OFFICER, phone: '08022334455', isFrozen: false },
    { id: 'user-3', userIdNumber: formatUserId(3), name: 'Admin Chioma', email: 'admin@perfectbank.com', role: Role.ADMIN, phone: '08033445566', isFrozen: false },
    { id: 'user-4', userIdNumber: formatUserId(4), name: 'Adekunle Gold', email: 'adekunle.g@example.com', role: Role.BORROWER, phone: '08045678901', isFrozen: false },
    { id: 'user-5', userIdNumber: formatUserId(5), name: 'Bisi Alawiye', email: 'bisi.a@example.com', role: Role.BORROWER, phone: '08056789012', isFrozen: true },
    { id: 'user-6', userIdNumber: formatUserId(6), name: 'Chidinma Ekile', email: 'chidinma.e@example.com', role: Role.BORROWER, phone: '08067890123', isFrozen: false },
    { id: 'user-7', userIdNumber: formatUserId(7), name: 'David Adeleke', email: 'david.a@example.com', role: Role.BORROWER, phone: '08078901234', isFrozen: false },
    { id: 'user-8', userIdNumber: formatUserId(8), name: 'Emeka Okafor', email: 'emeka.o@example.com', role: Role.BORROWER, phone: '08089012345', isFrozen: false },
    { id: 'user-9', userIdNumber: formatUserId(9), name: 'Funke Akindele', email: 'funke.a@example.com', role: Role.BORROWER, phone: '08090123456', isFrozen: false },
    { id: 'user-10', userIdNumber: formatUserId(10), name: 'Godwin Okon', email: 'godwin.o@example.com', role: Role.BORROWER, phone: '08101234567', isFrozen: false },
    { id: 'user-11', userIdNumber: formatUserId(11), name: 'Halima Abubakar', email: 'halima.a@perfectbank.com', role: Role.LOAN_OFFICER, phone: '08112345678', isFrozen: false },
    { id: 'user-12', userIdNumber: formatUserId(12), name: 'Ibrahim Suleiman', email: 'ibrahim.s@example.com', role: Role.BORROWER, phone: '08123456789', isFrozen: false },
    { id: 'user-13', userIdNumber: formatUserId(13), name: 'Jide Kosoko', email: 'jide.k@perfectbank.com', role: Role.ADMIN, phone: '08134567890', isFrozen: false },
    { id: 'user-14', userIdNumber: formatUserId(14), name: 'Kemi Adetiba', email: 'kemi.a@perfectbank.com', role: Role.LOAN_OFFICER, phone: '08145678901', isFrozen: false },
    { id: 'user-15', userIdNumber: formatUserId(15), name: 'Lola Idije', email: 'lola.i@example.com', role: Role.BORROWER, phone: '08156789012', isFrozen: false },
    { id: 'user-16', userIdNumber: formatUserId(16), name: 'Ngozi Ezeonu', email: 'ngozi.e@example.com', role: Role.BORROWER, phone: '08167890123', isFrozen: false },
    // 5 New Loan Officers
    { id: 'user-17', userIdNumber: formatUserId(17), name: 'Tunde Ednut', email: 'tunde.e@perfectbank.com', role: Role.LOAN_OFFICER, phone: '09011223344', isFrozen: false },
    { id: 'user-18', userIdNumber: formatUserId(18), name: 'Simi Adejumo', email: 'simi.a@perfectbank.com', role: Role.LOAN_OFFICER, phone: '09022334455', isFrozen: false },
    { id: 'user-19', userIdNumber: formatUserId(19), name: 'Falz Falana', email: 'falz.f@perfectbank.com', role: Role.LOAN_OFFICER, phone: '09033445566', isFrozen: false },
    { id: 'user-20', userIdNumber: formatUserId(20), name: 'Wizkid Balogun', email: 'wizkid.b@perfectbank.com', role: Role.LOAN_OFFICER, phone: '09044556677', isFrozen: true },
    { id: 'user-21', userIdNumber: formatUserId(21), name: 'Olamide Adedeji', email: 'olamide.a@perfectbank.com', role: Role.LOAN_OFFICER, phone: '09055667788', isFrozen: false },
];


let loans: Loan[] = [
    {
        id: 'loan-1', userId: 'user-1', userName: 'John Doe', amount: 50000, duration: 6, purpose: 'Home renovation', guarantorIds: [formatUserId(4), formatUserId(5), formatUserId(6), formatUserId(7)],
        status: LoanStatus.APPROVED, applicationDate: new Date('2024-05-10').toISOString(), approvalDate: new Date('2024-05-12').toISOString(),
    },
    {
        id: 'loan-2', userId: 'user-4', userName: 'Adekunle Gold', amount: 120000, duration: 12, purpose: 'New tailoring machine', guarantorIds: [formatUserId(1), formatUserId(5), formatUserId(8), formatUserId(9)],
        status: LoanStatus.PENDING, applicationDate: new Date('2024-07-20').toISOString(),
    },
    {
        id: 'loan-3', userId: 'user-5', userName: 'Bisi Alawiye', amount: 75000, duration: 6, purpose: 'School fees', guarantorIds: [formatUserId(6), formatUserId(7), formatUserId(8), formatUserId(9)],
        status: LoanStatus.REJECTED, applicationDate: new Date('2024-06-15').toISOString(),
    },
    {
        id: 'loan-4', userId: 'user-6', userName: 'Chidinma Ekile', amount: 250000, duration: 24, purpose: 'Business expansion', guarantorIds: [formatUserId(10), formatUserId(12), formatUserId(15), formatUserId(16)],
        status: LoanStatus.COMPLETED, applicationDate: new Date('2022-01-15').toISOString(), approvalDate: new Date('2022-01-20').toISOString(),
    },
    {
        id: 'loan-5', userId: 'user-7', userName: 'David Adeleke', amount: 1500000, duration: 36, purpose: 'Music video production', guarantorIds: [formatUserId(1), formatUserId(4), formatUserId(9), formatUserId(10)],
        status: LoanStatus.APPROVED, applicationDate: new Date('2024-06-01').toISOString(), approvalDate: new Date('2024-06-05').toISOString(),
    },
    {
        id: 'loan-6', userId: 'user-8', userName: 'Emeka Okafor', amount: 30000, duration: 3, purpose: 'Medical bills', guarantorIds: [formatUserId(5), formatUserId(9), formatUserId(10), formatUserId(12)],
        status: LoanStatus.PENDING, applicationDate: new Date('2024-07-22').toISOString(),
    },
    {
        id: 'loan-7', userId: 'user-9', userName: 'Funke Akindele', amount: 500000, duration: 12, purpose: 'Film equipment', guarantorIds: [formatUserId(1), formatUserId(4), formatUserId(7), formatUserId(16)],
        status: LoanStatus.COMPLETED, applicationDate: new Date('2023-03-10').toISOString(), approvalDate: new Date('2023-03-15').toISOString(),
    },
    {
        id: 'loan-8', userId: 'user-1', userName: 'John Doe', amount: 25000, duration: 6, purpose: 'Phone repair', guarantorIds: [formatUserId(15), formatUserId(12), formatUserId(8), formatUserId(5)],
        status: LoanStatus.COMPLETED, applicationDate: new Date('2023-11-01').toISOString(), approvalDate: new Date('2023-11-03').toISOString(),
    },
     {
        id: 'loan-9', userId: 'user-12', userName: 'Ibrahim Suleiman', amount: 80000, duration: 9, purpose: 'Rent', guarantorIds: [formatUserId(1), formatUserId(4), formatUserId(5), formatUserId(6)],
        status: LoanStatus.PENDING, applicationDate: new Date().toISOString(),
    },
    {
        id: 'loan-10', userId: 'user-15', userName: 'Lola Idije', amount: 45000, duration: 6, purpose: 'Festival contribution', guarantorIds: [formatUserId(16), formatUserId(12), formatUserId(9), formatUserId(8)],
        status: LoanStatus.APPROVED, applicationDate: new Date('2024-07-01').toISOString(), approvalDate: new Date('2024-07-03').toISOString(),
    },
    {
        id: 'loan-11', userId: 'user-16', userName: 'Ngozi Ezeonu', amount: 200000, duration: 18, purpose: 'Farming supplies', guarantorIds: [formatUserId(4), formatUserId(5), formatUserId(7), formatUserId(9)],
        status: LoanStatus.REJECTED, applicationDate: new Date('2024-07-05').toISOString(),
    },
];

const generateRepaymentsForLoan = (loan: Loan, allPaid: boolean = false): Repayment[] => {
    if (!loan.approvalDate) return [];
    const loanRepayments: Repayment[] = [];
    const monthlyPayment = loan.amount / loan.duration;
    
    for (let i = 0; i < loan.duration; i++) {
        const dueDate = new Date(loan.approvalDate!);
        dueDate.setMonth(dueDate.getMonth() + i + 1);

        let status = RepaymentStatus.UPCOMING;
        if (allPaid) {
            status = RepaymentStatus.PAID;
        } else {
            const now = new Date();
            if (dueDate < now) {
                // simple logic to make some overdue
                status = (i % 4 === 0 && i > 0) ? RepaymentStatus.OVERDUE : RepaymentStatus.PAID;
            }
        }

        loanRepayments.push({
            id: `rep-${i + 1}-${loan.id}`,
            loanId: loan.id,
            installment: i + 1,
            amount: monthlyPayment,
            dueDate: dueDate.toISOString(),
            status,
        });
    }
    return loanRepayments;
}


let repayments: Repayment[] = [
    ...generateRepaymentsForLoan(loans.find(l => l.id === 'loan-1')!),
    ...generateRepaymentsForLoan(loans.find(l => l.id === 'loan-4')!, true),
    ...generateRepaymentsForLoan(loans.find(l => l.id === 'loan-5')!),
    ...generateRepaymentsForLoan(loans.find(l => l.id === 'loan-7')!, true),
    ...generateRepaymentsForLoan(loans.find(l => l.id === 'loan-8')!, true),
    ...generateRepaymentsForLoan(loans.find(l => l.id === 'loan-10')!),
];

let smsLogs: SmsLog[] = [
    { id: 'sms-1', loanId: 'loan-1', borrowerName: 'John Doe', message: 'Your loan application has been approved.', date: new Date('2024-05-12').toISOString(), status: 'SENT' },
    { id: 'sms-2', loanId: 'loan-1', borrowerName: 'John Doe', message: 'Your repayment is due soon.', date: new Date('2024-07-10').toISOString(), status: 'SENT' },
    { id: 'sms-3', loanId: 'loan-3', borrowerName: 'Bisi Alawiye', message: 'Your loan application was rejected.', date: new Date('2024-06-16').toISOString(), status: 'SENT' },
    { id: 'sms-4', loanId: 'loan-4', borrowerName: 'Chidinma Ekile', message: 'Congratulations on completing your loan repayment!', date: new Date('2024-01-20').toISOString(), status: 'SENT' },
    { id: 'sms-5', loanId: 'loan-5', borrowerName: 'David Adeleke', message: 'Your loan of N1,500,000 has been approved.', date: new Date('2024-06-05').toISOString(), status: 'SENT' },
    { id: 'sms-6', loanId: 'loan-5', borrowerName: 'David Adeleke', message: 'Payment reminder: Your installment is due in 3 days.', date: new Date('2024-07-02').toISOString(), status: 'SCHEDULED' },
];

// --- API TYPES ---

export interface LoginCredentials {
    identifier: string;
    password?: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- API IMPLEMENTATIONS ---

export const apiLogin = async (credentials: LoginCredentials): Promise<User> => {
    await delay(500);
    const identifier = credentials.identifier.toLowerCase();
    const user = users.find(u => 
        u.email.toLowerCase() === identifier || 
        u.userIdNumber.toLowerCase() === identifier
    );
    
    if (!user) {
        throw new Error('User not found');
    }

    if (user.isFrozen) {
        throw new Error('Your account has been frozen. Please contact support.');
    }

    return user;
};

export const apiRegister = async (userData: Omit<User, 'id' | 'role' | 'userIdNumber' | 'pictureIdUrl'>): Promise<User> => {
    await delay(500);
    if (users.some(u => u.email === userData.email)) {
        throw new Error('User with this email already exists');
    }
    const newUser: User = {
        id: uuid(),
        userIdNumber: formatUserId(users.length + 1),
        ...userData,
        role: Role.BORROWER,
        isFrozen: false,
    };
    users.push(newUser);
    return newUser;
};

// ... (keep existing loan/repayment/sms APIs)
export const apiGetBorrowerLoan = async (userId: string): Promise<Loan | null> => {
    await delay(300);
    // Return the most recent loan application for the user that isn't completed or rejected
    const userLoans = loans.filter(l => l.userId === userId && l.status !== LoanStatus.COMPLETED && l.status !== LoanStatus.REJECTED)
        .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());
    return userLoans[0] || null;
};

export const apiGetBorrowerLoans = async (userId: string): Promise<Loan[]> => {
    await delay(400);
    return loans.filter(l => l.userId === userId).sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());
};

export const apiGetRepayments = async (loanId: string): Promise<Repayment[]> => {
    await delay(300);
    return repayments.filter(r => r.loanId === loanId);
};

export const apiApplyForLoan = async (applicationData: Omit<Loan, 'id' | 'userName' | 'status' | 'applicationDate' | 'approvalDate'>): Promise<Loan> => {
    await delay(1000);
    const user = users.find(u => u.id === applicationData.userId);
    if (!user) throw new Error('User not found for loan application');

    // Verify guarantors exist
    const guarantorsExist = applicationData.guarantorIds.every(id => users.some(u => u.userIdNumber === id));
    if (!guarantorsExist) {
        throw new Error('One or more guarantor IDs are invalid.');
    }
    
    const newLoan: Loan = {
        id: uuid(),
        userName: user.name,
        status: LoanStatus.PENDING,
        applicationDate: new Date().toISOString(),
        ...applicationData,
    };
    loans.push(newLoan);
    return newLoan;
};

export const apiGetLoansByStatus = async (status: LoanStatus): Promise<Loan[]> => {
    await delay(400);
    return loans.filter(l => l.status === status);
};

export const apiGetLoansByStatuses = async (statuses: LoanStatus[]): Promise<Loan[]> => {
    await delay(400);
    return loans.filter(l => statuses.includes(l.status));
};


export const apiReviewLoan = async (loanId: string, status: LoanStatus.APPROVED | LoanStatus.REJECTED): Promise<Loan> => {
    await delay(800);
    const loanIndex = loans.findIndex(l => l.id === loanId);
    if (loanIndex === -1) {
        throw new Error('Loan not found');
    }
    const updatedLoan = loans[loanIndex];
    updatedLoan.status = status;
    
    const borrower = users.find(u => u.id === updatedLoan.userId);
    if (!borrower) throw new Error('Borrower not found');

    if (status === LoanStatus.APPROVED) {
        updatedLoan.approvalDate = new Date().toISOString();
        const newRepayments = generateRepaymentsForLoan(updatedLoan);
        repayments.push(...newRepayments);

        // Schedule reminder SMS messages for the new repayments
        newRepayments.forEach(rep => {
            if (rep.status === 'UPCOMING') {
                 const reminderDate = new Date(rep.dueDate);
                 reminderDate.setDate(reminderDate.getDate() - 3);
                 if (reminderDate > new Date()) { // Only schedule for the future
                     smsLogs.push({
                         id: uuid(),
                         loanId: updatedLoan.id,
                         borrowerName: borrower.name,
                         message: `Hi ${borrower.name}, your payment of ₦${rep.amount.toFixed(2)} is due on ${new Date(rep.dueDate).toLocaleDateString()}.`,
                         date: reminderDate.toISOString(),
                         status: 'SCHEDULED'
                     });
                 }
            }
        });
    }

    smsLogs.push({
        id: uuid(),
        loanId: updatedLoan.id,
        borrowerName: borrower.name,
        message: `Your loan of ₦${updatedLoan.amount.toLocaleString()} has been ${status.toLowerCase()}.`,
        date: new Date().toISOString(),
        status: 'SENT'
    });

    return updatedLoan;
};

export const apiSendManualSms = async (loanId: string, message: string): Promise<SmsLog> => {
    await delay(600);
    const loan = loans.find(l => l.id === loanId);
    if (!loan) throw new Error('Loan not found');

    const newSms: SmsLog = {
        id: uuid(),
        loanId: loanId,
        borrowerName: loan.userName,
        message: message,
        date: new Date().toISOString(),
        status: 'SENT'
    };
    smsLogs.push(newSms);
    return newSms;
};

export const apiGetSmsLogsForLoan = async (loanId: string): Promise<SmsLog[]> => {
    await delay(300);
    return smsLogs.filter(log => log.loanId === loanId);
};

export const apiGetAllLoans = async (): Promise<Loan[]> => {
    await delay(300);
    return [...loans];
};

export const apiGetAllSmsLogs = async (): Promise<SmsLog[]> => {
    await delay(300);
    return [...smsLogs];
};

export const apiGetAllUsers = async (): Promise<User[]> => {
    await delay(300);
    return [...users];
};

export const apiGetLoanById = async (loanId: string): Promise<Loan | null> => {
    await delay(300);
    return loans.find(l => l.id === loanId) || null;
}

export const apiGetUserByUserIdNumber = async (userIdNumber: string): Promise<User | null> => {
    await delay(200);
    if (typeof userIdNumber !== 'string') return null;
    const user = users.find(u => u.userIdNumber.toLowerCase() === userIdNumber.toLowerCase());
    // Also check the user's ID for backward compatibility in some cases
     if (user) return user;
    return users.find(u => u.id === userIdNumber) || null;
}

// --- NEW APIs ---

export const apiUpdatePassword = async (userId: string, currentPass: string, newPass: string): Promise<void> => {
    await delay(700);
    // In a real app, you'd verify the current password here. We'll just simulate success.
    console.log(`Password updated for user ${userId}`);
    return Promise.resolve();
};

export const apiAdminCreateUser = async (userData: Omit<User, 'id' | 'userIdNumber' | 'pictureIdUrl' | 'bvn' | 'nin' | 'isFrozen'>): Promise<User> => {
    await delay(600);
    if (users.some(u => u.email === userData.email)) {
        throw new Error('User with this email already exists.');
    }
    const newUser: User = {
        id: uuid(),
        userIdNumber: formatUserId(users.length + 1),
        ...userData,
        isFrozen: false,
    };
    users.push(newUser);
    return newUser;
};

export const apiAdminDeleteUser = async (userId: string): Promise<void> => {
    await delay(500);
    users = users.filter(u => u.id !== userId);
    return Promise.resolve();
};

export const apiAdminToggleFreezeUser = async (userId: string): Promise<User> => {
    await delay(400);
    const user = users.find(u => u.id === userId);
    if (!user) {
        throw new Error('User not found.');
    }
    user.isFrozen = !user.isFrozen;
    return { ...user };
};

export const apiAdminSendBulkSms = async ({ recipientIds, message, scheduleDate }: { recipientIds: string[], message: string, scheduleDate?: string }): Promise<void> => {
    await delay(800);
    const newLogs: SmsLog[] = [];
    for (const userId of recipientIds) {
        const user = users.find(u => u.id === userId);
        if (user) {
            // Find any loan to associate with, preferably an active one
            const userLoan = loans.find(l => l.userId === userId && l.status === LoanStatus.APPROVED) || loans.find(l => l.userId === userId);
            newLogs.push({
                id: uuid(),
                loanId: userLoan ? userLoan.id : 'N/A',
                borrowerName: user.name,
                message: message,
                date: scheduleDate || new Date().toISOString(),
                status: scheduleDate ? 'SCHEDULED' : 'SENT',
            });
        }
    }
    smsLogs.push(...newLogs);
    return Promise.resolve();
};
