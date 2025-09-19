
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loan, Repayment, LoanStatus, RepaymentStatus } from '../types';
import { apiGetBorrowerLoan, apiGetRepayments, apiApplyForLoan, apiGetBorrowerLoans } from '../services/mockApi';
import { Card, Button, Input, Table, Badge, Modal } from '../components/ui';
import { BanknoteIcon, FileClockIcon, FilePlusIcon } from '../constants';

const BorrowerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [loan, setLoan] = useState<Loan | null>(null);
    const [nextPayment, setNextPayment] = useState<Repayment | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                const currentLoan = await apiGetBorrowerLoan(user.id);
                setLoan(currentLoan);
                if (currentLoan) {
                    const repayments = await apiGetRepayments(currentLoan.id);
                    const upcoming = repayments.find(r => r.status === RepaymentStatus.UPCOMING);
                    setNextPayment(upcoming || null);
                }
            }
        };
        fetchData();
    }, [user]);

    return (
        <div>
            <h2 className="text-3xl font-bold text-secondary mb-6">Your Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card title="Active Loan" icon={<BanknoteIcon className="w-6 h-6"/>}>
                    {loan && loan.status === LoanStatus.APPROVED ? (
                        <div>
                            <p className="text-3xl font-bold text-primary">₦{loan.amount.toLocaleString()}</p>
                            <p className="text-sm text-gray-500 mt-2">Repayment due: ₦{nextPayment?.amount.toLocaleString()} on {nextPayment ? new Date(nextPayment.dueDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    ) : (
                        <p className="text-gray-500">No active loan.</p>
                    )}
                </Card>
                 <Card title="Loan Status" icon={<FileClockIcon className="w-6 h-6"/>}>
                    {loan ? (
                         <div className="flex items-center space-x-2">
                             <p className="text-gray-700">Your current application is</p> 
                             <Badge color={loan.status === LoanStatus.APPROVED ? 'green' : loan.status === LoanStatus.PENDING ? 'yellow' : 'red'}>{loan.status}</Badge>
                         </div>
                    ) : (
                        <p className="text-gray-500">You have not applied for a loan.</p>
                    )}
                </Card>
                <Card title="New Loan" icon={<FilePlusIcon className="w-6 h-6"/>}>
                    {loan ? (
                        <div>
                            <p className="text-gray-500 mb-4">You cannot apply for a new loan while you have an active or pending application.</p>
                            <Button onClick={() => navigate('/app/borrower/status')} variant="secondary">View Status</Button>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-500 mb-4">Ready to pursue your goals?</p>
                            <Button onClick={() => navigate('/app/borrower/apply')}>Apply Now</Button>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
};

const ApplyLoan: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [duration, setDuration] = useState('');
    const [purpose, setPurpose] = useState('');
    const [guarantorIds, setGuarantorIds] = useState(['', '', '', '']);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [hasActiveLoan, setHasActiveLoan] = useState<boolean | null>(null);

    useEffect(() => {
        const checkActiveLoan = async () => {
            if (user) {
                const currentLoan = await apiGetBorrowerLoan(user.id);
                setHasActiveLoan(!!currentLoan);
            }
        };
        checkActiveLoan();
    }, [user]);

    const handleGuarantorIdChange = (index: number, value: string) => {
        const newIds = [...guarantorIds];
        newIds[index] = value;
        setGuarantorIds(newIds);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || guarantorIds.some(id => id.trim() === '')) {
            setMessage('Please fill in all fields, including all four guarantor IDs.');
            return;
        }
        setSubmitting(true);
        setMessage('');

        try {
            await apiApplyForLoan({
                userId: user.id,
                amount: parseInt(amount, 10),
                duration: parseInt(duration, 10),
                purpose,
                guarantorIds,
            });
            setMessage('Loan application submitted successfully!');
            setTimeout(() => navigate('/app/borrower/dashboard'), 2000);
        } catch (error) {
            setMessage('Failed to submit application. Please ensure all guarantor IDs are valid.');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };
    
    if (hasActiveLoan === null) {
        return <Card title="Loan Application Form"><p>Checking your loan status...</p></Card>;
    }

    if (hasActiveLoan) {
        return (
            <Card title="Loan Application Unavailable">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">
                        You have an active or pending loan application. You can apply for a new loan once your current loan is completed or resolved.
                    </p>
                    <Button onClick={() => navigate('/app/borrower/status')}>View Loan Status</Button>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Loan Application Form">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Loan Amount (₦)" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
                    <Input label="Duration (months)" type="number" value={duration} onChange={e => setDuration(e.target.value)} required />
                </div>
                <Input label="Purpose of Loan" type="text" value={purpose} onChange={e => setPurpose(e.target.value)} required />
                
                <div className="space-y-2 pt-2">
                     <h4 className="font-medium text-gray-700">Guarantor Information</h4>
                     <p className="text-xs text-gray-500">Please provide the User ID Number for four guarantors.</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {guarantorIds.map((id, index) => (
                             <Input 
                                key={index}
                                label={`Guarantor ${index + 1} ID`} 
                                type="text" 
                                value={id} 
                                onChange={e => handleGuarantorIdChange(index, e.target.value)} 
                                required 
                                placeholder="e.g., PMB-00002"
                            />
                        ))}
                     </div>
                </div>

                <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</Button>
                {message && <p className={`mt-4 text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
            </form>
        </Card>
    );
};

const LoanStatusPage: React.FC = () => {
    const { user } = useAuth();
    const [loan, setLoan] = useState<Loan | null>(null);
    const [repayments, setRepayments] = useState<Repayment[]>([]);
    
    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                const currentLoan = await apiGetBorrowerLoan(user.id);
                setLoan(currentLoan);
                if (currentLoan) {
                    const schedule = await apiGetRepayments(currentLoan.id);
                    setRepayments(schedule);
                }
            }
        };
        fetchData();
    }, [user]);

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
        <div>
            <h2 className="text-3xl font-bold text-secondary mb-6">Loan Status</h2>
            {loan ? (
                <div className="space-y-6">
                    <Card title="Loan Details">
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div><p className="text-sm text-gray-500">Amount</p><p className="font-semibold">₦{loan.amount.toLocaleString()}</p></div>
                            <div><p className="text-sm text-gray-500">Status</p><p><Badge color={loan.status === LoanStatus.APPROVED ? 'green' : loan.status === LoanStatus.PENDING ? 'yellow' : 'red'}>{loan.status}</Badge></p></div>
                            <div><p className="text-sm text-gray-500">Applied</p><p className="font-semibold">{new Date(loan.applicationDate).toLocaleDateString()}</p></div>
                            <div><p className="text-sm text-gray-500">Approved</p><p className="font-semibold">{loan.approvalDate ? new Date(loan.approvalDate).toLocaleDateString() : 'N/A'}</p></div>
                         </div>
                    </Card>
                    <Card title="Repayment Schedule">
                        <Table columns={repaymentColumns} data={repayments} />
                    </Card>
                </div>
            ) : (
                <Card><p>No loan application found.</p></Card>
            )}
        </div>
    );
};

interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: string;
    status: React.ReactNode;
}

const LoanHistory: React.FC = () => {
    const { user } = useAuth();
    const [loans, setLoans] = useState<Loan[]>([]);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (user) {
                setIsLoading(true);
                const loanHistory = await apiGetBorrowerLoans(user.id);
                setLoans(loanHistory);
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

    const handleViewDetails = async (loan: Loan) => {
        setSelectedLoan(loan);
        let transactionList: Transaction[] = [];

        if (loan.status === LoanStatus.APPROVED || loan.status === LoanStatus.COMPLETED) {
            // Add disbursement transaction
            if (loan.approvalDate) {
                transactionList.push({
                    id: `disburse-${loan.id}`,
                    date: loan.approvalDate,
                    description: 'Loan Disbursed',
                    amount: `+ ₦${loan.amount.toLocaleString()}`,
                    status: <Badge color="green">COMPLETED</Badge>,
                });
            }

            // Fetch and add repayment transactions
            const repayments = await apiGetRepayments(loan.id);
            const repaymentTransactions: Transaction[] = repayments.map(r => {
                const colorMap: { [key in RepaymentStatus]: 'green' | 'yellow' | 'red' } = { 
                    [RepaymentStatus.PAID]: 'green', 
                    [RepaymentStatus.UPCOMING]: 'yellow', 
                    [RepaymentStatus.OVERDUE]: 'red' 
                };
                return {
                    id: r.id,
                    date: r.dueDate,
                    description: `Installment ${r.installment} Repayment`,
                    amount: `- ₦${r.amount.toLocaleString()}`,
                    status: <Badge color={colorMap[r.status]}>{r.status}</Badge>,
                }
            });
            transactionList = [...transactionList, ...repaymentTransactions];
        }
        
        // Sort transactions by date
        transactionList.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setTransactions(transactionList);
    };
    
    const loanColumns: Array<{ header: string; accessor: keyof Loan | ((item: Loan) => React.ReactNode) }> = [
        { header: 'Application Date', accessor: (item) => new Date(item.applicationDate).toLocaleDateString() },
        { header: 'Amount', accessor: (item) => `₦${item.amount.toLocaleString()}` },
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

    const transactionColumns: Array<{ header: string; accessor: keyof Transaction | ((item: Transaction) => React.ReactNode) }> = [
        { header: 'Date', accessor: (item: Transaction) => new Date(item.date).toLocaleDateString() },
        { header: 'Description', accessor: 'description' },
        { header: 'Amount', accessor: 'amount' },
        { header: 'Status', accessor: 'status' },
    ];
    
    return (
        <div>
            <h2 className="text-3xl font-bold text-secondary mb-6">Loan History</h2>
            <Card>
                {isLoading ? <p>Loading history...</p> : <Table columns={loanColumns} data={loans} />}
            </Card>

            <Modal isOpen={!!selectedLoan} onClose={() => setSelectedLoan(null)} title={`Loan Details`}>
                {selectedLoan && (
                    <div className="space-y-4">
                        <div className="p-4 bg-light rounded-md grid grid-cols-2 gap-4 text-sm">
                            <div><p className="text-gray-500">Amount</p><p className="font-semibold">₦{selectedLoan.amount.toLocaleString()}</p></div>
                            <div><p className="text-gray-500">Duration</p><p className="font-semibold">{selectedLoan.duration} months</p></div>
                            <div><p className="text-gray-500">Purpose</p><p className="font-semibold">{selectedLoan.purpose}</p></div>
                             <div><p className="text-gray-500">Status</p><p className="font-semibold">{selectedLoan.status}</p></div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-secondary mb-2">Transaction History</h4>
                            <div className="max-h-80 overflow-y-auto">
                                <Table columns={transactionColumns} data={transactions} />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};


const BorrowerPage: React.FC = () => {
    return (
        <Routes>
            <Route path="dashboard" element={<BorrowerDashboard />} />
            <Route path="apply" element={<ApplyLoan />} />
            <Route path="status" element={<LoanStatusPage />} />
            <Route path="history" element={<LoanHistory />} />
        </Routes>
    );
}

export default BorrowerPage;