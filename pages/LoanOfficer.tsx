import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { Loan, LoanStatus, SmsLog, Repayment, RepaymentStatus, User, Role } from '../types';
import { apiGetLoansByStatus, apiReviewLoan, apiGetAllSmsLogs, apiSendManualSms, apiGetLoansByStatuses, apiGetRepayments, apiGetLoanById, apiGetUserByUserIdNumber, apiGetBorrowerLoans, apiGetAllUsers, apiAdminSendBulkSms } from '../services/mockApi';
import { Card, Button, Table, Badge, Modal, Input } from '../components/ui';

const calculateMembershipDuration = (joinDate: string): string => {
    const start = new Date(joinDate);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    
    if (months < 0 || (months === 0 && now.getDate() < start.getDate())) {
        years--;
        months = (months + 12) % 12;
    }
    
    if (now.getDate() < start.getDate()) {
        months--;
         if (months < 0) {
            years--;
            months += 12;
        }
    }
    
    if (years === 0 && months === 0) {
        return "New member";
    }

    const yearStr = years > 0 ? `${years} year${years > 1 ? 's' : ''}` : '';
    const monthStr = months > 0 ? `${months} month${months > 1 ? 's' : ''}` : '';
    
    return [yearStr, monthStr].filter(Boolean).join(', ');
};

const OfficerDashboard: React.FC = () => {
    const [pendingLoans, setPendingLoans] = useState<Loan[]>([]);
    const [approvedLoans, setApprovedLoans] = useState<Loan[]>([]);
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchLoans = async () => {
            const pending = await apiGetLoansByStatus(LoanStatus.PENDING);
            const approved = await apiGetLoansByStatus(LoanStatus.APPROVED);
            setPendingLoans(pending);
            setApprovedLoans(approved);
        };
        fetchLoans();
    }, []);

    const handleReviewClick = (loan: Loan) => {
        navigate(`/app/officer/review/${loan.id}`);
    };

    const pendingLoanColumns: Array<{ header: string; accessor: keyof Loan | ((item: Loan) => React.ReactNode) }> = [
        { header: 'User', accessor: 'userName' },
        { header: 'Amount', accessor: (item: Loan) => `₦${item.amount.toLocaleString()}` },
        { header: 'Date', accessor: (item: Loan) => new Date(item.applicationDate).toLocaleDateString() },
        { header: 'Status', accessor: (item: Loan) => <Badge color="yellow">{item.status}</Badge> },
        { header: 'Actions', accessor: (item: Loan) => (
            <Button onClick={() => handleReviewClick(item)} variant="secondary" className="py-1 px-3 text-sm">Review</Button>
        )},
    ];
    
    const activeLoanColumns: Array<{ header: string; accessor: keyof Loan | ((item: Loan) => React.ReactNode) }> = [
        { header: 'User', accessor: 'userName' },
        { header: 'Amount', accessor: (item: Loan) => `₦${item.amount.toLocaleString()}`},
        { header: 'Approved On', accessor: (item: Loan) => item.approvalDate ? new Date(item.approvalDate).toLocaleDateString() : 'N/A' },
        { header: 'Status', accessor: (item: Loan) => <Badge color="green">{item.status}</Badge> },
    ];

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-secondary">Loan Officer Dashboard</h2>
            <Card title="Pending Loan Applications">
                <Table columns={pendingLoanColumns} data={pendingLoans} />
            </Card>
             <Card title="Active Loans">
                <Table columns={activeLoanColumns} data={approvedLoans} />
            </Card>
        </div>
    );
};

interface GuarantorInfo {
    user: User | null;
    loans: Loan[];
}

const LoanReviewPage: React.FC = () => {
    const { loanId } = useParams<{ loanId: string }>();
    const navigate = useNavigate();
    const [loan, setLoan] = useState<Loan | null>(null);
    const [applicant, setApplicant] = useState<User | null>(null);
    const [applicantLoans, setApplicantLoans] = useState<Loan[]>([]);
    const [guarantorsInfo, setGuarantorsInfo] = useState<GuarantorInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!loanId) return;

        const fetchAllData = async () => {
            setIsLoading(true);
            const currentLoan = await apiGetLoanById(loanId);
            if (!currentLoan) {
                setIsLoading(false);
                return;
            }
            setLoan(currentLoan);

            // Fetch applicant data
            const applicantUser = await apiGetUserByUserIdNumber(currentLoan.userId);
            setApplicant(applicantUser);
            if (applicantUser) {
                const appLoans = await apiGetBorrowerLoans(applicantUser.id);
                setApplicantLoans(appLoans);
            }

            // Fetch guarantor data
            const gInfo = await Promise.all(currentLoan.guarantorIds.map(async (id) => {
                const gUser = await apiGetUserByUserIdNumber(id);
                if (gUser) {
                    const gLoans = await apiGetBorrowerLoans(gUser.id);
                    return { user: gUser, loans: gLoans };
                }
                return { user: null, loans: [] };
            }));
            setGuarantorsInfo(gInfo);

            setIsLoading(false);
        };

        fetchAllData();
    }, [loanId]);
    
    const handleReviewSubmit = async (status: LoanStatus.APPROVED | LoanStatus.REJECTED) => {
        if (loan) {
            setIsSubmitting(true);
            await apiReviewLoan(loan.id, status);
            setIsSubmitting(false);
            navigate('/app/officer/dashboard');
        }
    };
    
    const loanHistoryColumns: Array<{ header: string; accessor: keyof Loan | ((item: Loan) => React.ReactNode) }> = [
        { header: 'Date', accessor: (item) => new Date(item.applicationDate).toLocaleDateString() },
        { header: 'Amount', accessor: (item) => `₦${item.amount.toLocaleString()}` },
        { header: 'Status', accessor: (item) => {
            const colorMap: { [key in LoanStatus]: 'green' | 'yellow' | 'red' | 'gray' } = {
                [LoanStatus.APPROVED]: 'green', [LoanStatus.PENDING]: 'yellow',
                [LoanStatus.REJECTED]: 'red', [LoanStatus.COMPLETED]: 'gray',
            };
            return <Badge color={colorMap[item.status]}>{item.status}</Badge>
        }},
    ];

    if (isLoading) return <p>Loading application details...</p>;
    if (!loan || !applicant) return <p>Could not find loan application.</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-3xl font-bold text-secondary">Loan Application Review</h2>
                <div className="flex space-x-3">
                    <Button variant="danger" onClick={() => handleReviewSubmit(LoanStatus.REJECTED)} disabled={isSubmitting}>Reject</Button>
                    <Button variant="success" onClick={() => handleReviewSubmit(LoanStatus.APPROVED)} disabled={isSubmitting}>Approve</Button>
                </div>
            </div>
             <p className="text-sm text-gray-500 text-center -mt-2">Note: Upon approval, automated payment reminders will be scheduled and sent to the applicant.</p>

            <Card title="Applicant & Loan Details">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div><p className="text-gray-500">Applicant Name</p><p className="font-semibold text-base text-gray-900">{applicant.name}</p></div>
                    <div><p className="text-gray-500">User ID</p><p className="font-semibold text-base text-gray-900">{applicant.userIdNumber}</p></div>
                    <div><p className="text-gray-500">Email Address</p><p className="font-semibold text-base text-gray-900">{applicant.email}</p></div>
                    <div><p className="text-gray-500">Phone Number</p><p className="font-semibold text-base text-gray-900">{applicant.phone}</p></div>
                    <div>
                        <p className="text-gray-500">Member Since</p>
                        <p className="font-semibold text-base text-gray-900">{new Date(applicant.createdAt).toLocaleDateString()} ({calculateMembershipDuration(applicant.createdAt)})</p>
                    </div>
                    <div><p className="text-gray-500">Loan Duration</p><p className="font-semibold text-base text-gray-900">{loan.duration} months</p></div>
                    <div className="md:col-span-2"><p className="text-gray-500">Loan Amount</p><p className="font-semibold text-base text-primary">₦{loan.amount.toLocaleString()}</p></div>
                    <div className="md:col-span-2"><p className="text-gray-500">Purpose of Loan</p><p className="font-semibold text-base text-gray-900">{loan.purpose}</p></div>
                 </div>
            </Card>

            <Card title="Applicant's Loan History">
                <Table columns={loanHistoryColumns} data={applicantLoans} />
            </Card>

            <Card title="Guarantor Information">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {guarantorsInfo.map((g, index) => (
                        <div key={index} className="p-4 bg-light rounded-lg">
                            <h4 className="font-bold text-secondary mb-2">Guarantor {index + 1}</h4>
                            {g.user ? (
                                <>
                                    <div className="flex justify-between items-baseline mb-3">
                                        <p className="font-semibold">{g.user.name}</p>
                                        <p className="text-sm text-gray-600">{g.user.userIdNumber}</p>
                                    </div>
                                    <Table columns={loanHistoryColumns} data={g.loans} />
                                </>
                            ) : (
                                <p className="text-red-600">Could not find user for ID: {loan.guarantorIds[index]}</p>
                            )}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};


const LoanHistory: React.FC = () => {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [repayments, setRepayments] = useState<Repayment[]>([]);


    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            const loanHistory = await apiGetLoansByStatuses([LoanStatus.COMPLETED, LoanStatus.REJECTED]);
            setLoans(loanHistory);
            setIsLoading(false);
        };
        fetchHistory();
    }, []);

    const handleViewDetails = async (loan: Loan) => {
        setSelectedLoan(loan);
        if (loan.status === LoanStatus.COMPLETED) {
            const reps = await apiGetRepayments(loan.id);
            setRepayments(reps);
        } else {
            setRepayments([]);
        }
    };
    
    const historyColumns: Array<{ header: string; accessor: keyof Loan | ((item: Loan) => React.ReactNode) }> = [
        { header: 'User', accessor: 'userName' },
        { header: 'Amount', accessor: (item) => `₦${item.amount.toLocaleString()}`},
        { header: 'Application Date', accessor: (item) => new Date(item.applicationDate).toLocaleDateString() },
        { header: 'Status', accessor: (item) => {
            const colorMap: { [key in LoanStatus]: 'green' | 'yellow' | 'red' | 'gray' } = {
                [LoanStatus.APPROVED]: 'green',
                [LoanStatus.PENDING]: 'yellow',
                [LoanStatus.REJECTED]: 'red',
                [LoanStatus.COMPLETED]: 'gray',
            };
            return <Badge color={colorMap[item.status]}>{item.status}</Badge>
        }},
        { header: 'Actions', accessor: (item) => <Button variant="secondary" className="text-sm py-1 px-3" onClick={() => handleViewDetails(item)}>View Details</Button> }
    ];

    const repaymentColumns: Array<{ header: string; accessor: keyof Repayment | ((item: Repayment) => React.ReactNode) }> = [
        { header: 'Installment', accessor: 'installment' },
        { header: 'Amount', accessor: (item: Repayment) => `₦${item.amount.toLocaleString()}` },
        { header: 'Due Date', accessor: (item: Repayment) => new Date(item.dueDate).toLocaleDateString() },
        { header: 'Status', accessor: (item: Repayment) => {
            const colorMap: { [key in RepaymentStatus]: 'green' | 'yellow' | 'red' } = { 
              [RepaymentStatus.PAID]: 'green', 
              [RepaymentStatus.UPCOMING]: 'yellow', 
              [RepaymentStatus.OVERDUE]: 'red' 
            };
            return <Badge color={colorMap[item.status]}>{item.status}</Badge>
        }},
    ];

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-secondary">Archived Loans</h2>
            <Card>
                {isLoading ? <p>Loading history...</p> : <Table columns={historyColumns} data={loans} />}
            </Card>

            <Modal isOpen={!!selectedLoan} onClose={() => setSelectedLoan(null)} title={`Details for ${selectedLoan?.userName}`}>
                {selectedLoan && (
                     <div className="space-y-4">
                        <div className="p-4 bg-light rounded-md grid grid-cols-2 gap-4 text-sm">
                            <div><p className="text-gray-500">Amount</p><p className="font-semibold">₦{selectedLoan.amount.toLocaleString()}</p></div>
                            <div><p className="text-gray-500">Duration</p><p className="font-semibold">{selectedLoan.duration} months</p></div>
                            <div><p className="text-gray-500">Purpose</p><p className="font-semibold">{selectedLoan.purpose}</p></div>
                            <div><p className="text-gray-500">Status</p><p className="font-semibold">{selectedLoan.status}</p></div>
                        </div>
                        {repayments.length > 0 && (
                             <div>
                                <h4 className="font-semibold text-secondary mb-2">Repayment History</h4>
                                <div className="max-h-80 overflow-y-auto">
                                    <Table columns={repaymentColumns} data={repayments} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

const OfficerSmsManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState('send');
    const [logs, setLogs] = useState<SmsLog[]>([]);
    const [borrowers, setBorrowers] = useState<User[]>([]);
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState('');

    const fetchLogs = async () => {
        const allLogs = await apiGetAllSmsLogs();
        setLogs(allLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    useEffect(() => {
        const fetchData = async () => {
            const allUsers = await apiGetAllUsers();
            setBorrowers(allUsers.filter(u => u.role === Role.BORROWER));
            await fetchLogs();
        };
        fetchData();
    }, []);

    const handleRecipientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // FIX: Use `e.target.selectedOptions` to directly get selected options and avoid type issues.
        // FIX: Cast `option` to `HTMLOptionElement` because its type was incorrectly inferred as 'unknown'.
        const options = Array.from(e.target.selectedOptions, option => (option as HTMLOptionElement).value);
        setSelectedRecipients(options);
    };

    const handleSubmit = async (isScheduled: boolean) => {
        if (selectedRecipients.length === 0 || !message) {
            setFeedback('Please select at least one recipient and write a message.');
            return;
        }
        if (isScheduled && !scheduleDate) {
            setFeedback('Please select a date and time for scheduled messages.');
            return;
        }

        setIsSubmitting(true);
        setFeedback('');
        try {
            await apiAdminSendBulkSms({
                recipientIds: selectedRecipients,
                message,
                scheduleDate: isScheduled ? new Date(scheduleDate).toISOString() : undefined,
            });
            setFeedback('Message sent/scheduled successfully!');
            setSelectedRecipients([]);
            setMessage('');
            setScheduleDate('');
            if (activeTab === 'logs') {
                await fetchLogs();
            }
        } catch (error) {
            setFeedback('Failed to send message.');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setFeedback(''), 4000);
        }
    };
    
    const columns: Array<{ header: string; accessor: keyof SmsLog | ((item: SmsLog) => React.ReactNode) }> = [
        { header: 'User', accessor: 'userName' },
        { header: 'Message', accessor: 'message' },
        { header: 'Date', accessor: (item: SmsLog) => new Date(item.date).toLocaleString() },
        { header: 'Status', accessor: (item: SmsLog) => {
            const colorMap: { [key in SmsLog['status']]: 'green' | 'red' | 'blue' } = {
                'SENT': 'green',
                'FAILED': 'red',
                'SCHEDULED': 'blue'
            };
            return <Badge color={colorMap[item.status]}>{item.status}</Badge>
        }},
    ];

    return (
        <Card title="SMS Center">
            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('send')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'send' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Send & Schedule</button>
                    <button onClick={() => { setActiveTab('logs'); fetchLogs(); }} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Message Logs</button>
                </nav>
            </div>

            {activeTab === 'send' && (
                <div className="space-y-4">
                     <div>
                        <label htmlFor="recipients" className="block text-sm font-medium text-gray-700">Recipients (hold Ctrl/Cmd to select multiple)</label>
                        <select
                            id="recipients"
                            multiple
                            value={selectedRecipients}
                            onChange={handleRecipientChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md h-40"
                        >
                            {borrowers.map(b => <option key={b.id} value={b.id}>{b.name} ({b.userIdNumber})</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                        <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required></textarea>
                     </div>
                     <div>
                        <Input label="Schedule for later (optional)" type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
                     </div>
                     {feedback && <p className={`text-sm ${feedback.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{feedback}</p>}
                     <div className="flex space-x-3">
                        <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Now'}</Button>
                        <Button onClick={() => handleSubmit(true)} disabled={isSubmitting} variant="secondary">{isSubmitting ? 'Scheduling...' : 'Schedule SMS'}</Button>
                     </div>
                </div>
            )}

            {activeTab === 'logs' && (
                <Table columns={columns} data={logs} />
            )}
        </Card>
    );
};


const LoanOfficerPage: React.FC = () => {
    return (
        <Routes>
            <Route path="dashboard" element={<OfficerDashboard />} />
            <Route path="sms-center" element={<OfficerSmsManagement />} />
            <Route path="history" element={<LoanHistory />} />
            <Route path="review/:loanId" element={<LoanReviewPage />} />
        </Routes>
    );
}

export default LoanOfficerPage;