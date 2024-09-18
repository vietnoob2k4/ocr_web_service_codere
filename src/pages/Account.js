import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import './Account.css'; // Import file CSS

const Account = () => {
    const [userData, setUserData] = useState(null);
    const [payments, setPayments] = useState([]);
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordChangeError, setPasswordChangeError] = useState(null);
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(null);
    const [showPasswordChangeForm, setShowPasswordChangeForm] = useState(false);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [feedbackContent, setFeedbackContent] = useState('');
    const [feedbackError, setFeedbackError] = useState(null);
    const [feedbackSuccess, setFeedbackSuccess] = useState(null);
    const [paymentsExpanded, setPaymentsExpanded] = useState(false);
    const [resultsExpanded, setResultsExpanded] = useState(false);

    const { token, userId } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                setError('No token found');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                // Fetch user data
                const userResponse = await axios.get('http://localhost:8000/user', { 
                    headers: { 'Authorization': `Bearer ${token}` } 
                });
                setUserData(userResponse.data);

                // Fetch payments
                const paymentsResponse = await axios.get(`http://localhost:8000/payments/user/${userId}`, { 
                    headers: { 'Authorization': `Bearer ${token}` } 
                });
                setPayments(paymentsResponse.data.payments || []);

                // Fetch results
                const resultsResponse = await axios.get(`http://localhost:8000/getUserResults/${userId}`, { 
                    headers: { 'Authorization': `Bearer ${token}` } 
                });
                const resultsWithFormattedDates = (resultsResponse.data.results || []).map(result => ({
                    ...result,
                    createdAt: new Date(result.createdAt).toLocaleDateString()
                }));
                setResults(resultsWithFormattedDates);
            } catch (error) {
                setError('Error fetching data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, userId]);

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            dispatch(logout());
            navigate('/login');
        }
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordChangeError('New passwords do not match');
            return;
        }
        axios.post('http://localhost:8000/users/change-password', { userId, newPassword }, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            setPasswordChangeSuccess(response.data.message);
            setNewPassword('');
            setConfirmPassword('');
            setPasswordChangeError(null);
            setShowPasswordChangeForm(false);
        })
        .catch(error => {
            setPasswordChangeError(error.response.data.error || 'Error changing password');
            setPasswordChangeSuccess(null);
        });
    };

    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8000/feedback', { userId, content: feedbackContent }, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            setFeedbackSuccess(response.data.message);
            setFeedbackContent('');
            setFeedbackError(null);
            setShowFeedbackForm(false);
        })
        .catch(error => {
            setFeedbackError(error.response.data.error || 'Error submitting feedback');
            setFeedbackSuccess(null);
        });
    };

    const togglePayments = () => setPaymentsExpanded(!paymentsExpanded);
    const toggleResults = () => setResultsExpanded(!resultsExpanded);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="account-container">
            <header className="account-header">
                <h2 className="account-title">Account</h2>
                <button className="response-button"> response </button>
            </header>

            <div className="user-info">
                <img src={userData?.profilePicture || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} alt="Profile" />
                <div className="user-info-content">
                {userData ? (
                        <>
                            <p><strong>Email:</strong> {userData.email}</p>
                            <p><strong>Registered At:</strong> {new Date(userData.createdAt).toLocaleDateString()}</p>
                            <p><strong>Subscription Type:</strong> {userData.subscription.type}</p>
                            {userData.subscription.type === 'per_use' && (
                                <p><strong>Remaining Uses:</strong> {userData.subscription.remainingUses}</p>
                            )}
                            {userData.subscription.type === 'monthly' && (
                                <p><strong>Valid Until:</strong> {new Date(userData.subscription.validUntil).toLocaleDateString()}</p>
                            )}
                            <button
                                className="change-password-button"
                                onClick={() => setShowPasswordChangeForm(!showPasswordChangeForm)}
                            >
                                Change Password
                            </button>
                            <button
                                className="feedback-button"
                                onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                            >
                                Feedback
                            </button>
                        </>
                    ) : (
                        <p>No user data found.</p>
                    )}
                </div>
            </div>

            {showPasswordChangeForm && (
                <form className="password-change-form" onSubmit={handlePasswordChange}>
                    <h3>Change Password</h3>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password:</label>
                        <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password:</label>
                        <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    {passwordChangeError && <p className="error">{passwordChangeError}</p>}
                    {passwordChangeSuccess && <p className="success">{passwordChangeSuccess}</p>}
                    <button type="submit" className="change-password-submit-button">Change Password</button>
                </form>
            )}

            {showFeedbackForm && (
                <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
                    <h3>Submit Feedback</h3>
                    <div className="form-group">
                        <label htmlFor="feedbackContent">Feedback:</label>
                        <textarea id="feedbackContent" value={feedbackContent} onChange={(e) => setFeedbackContent(e.target.value)} required />
                    </div>
                    {feedbackError && <p className="error">{feedbackError}</p>}
                    {feedbackSuccess && <p className="success">{feedbackSuccess}</p>}
                    <button type="submit" className="feedback-submit-button">Submit Feedback</button>
                </form>
            )}

            <section className="payment-history">
                <h3 className="payment-history-title" onClick={togglePayments}>
                    Payment History {paymentsExpanded ? '-' : '+'}
                </h3>
                <div className={`payment-list ${paymentsExpanded ? 'expanded' : ''}`}>
                    {payments.length > 0 ? (
                        <ul>
                            {payments.map(payment => (
                                <li key={payment._id} className="payment-item">
                                    <p><strong>Amount:</strong> ${payment.amount}</p>
                                    <p><strong>Payment Date:</strong> {payment.paymentDate}</p>
                                    <p><strong>Subscription Type:</strong> {payment.subscriptionType}</p>
                                    <p><strong>Status:</strong> {payment.status}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No payments found.</p>
                    )}
                </div>
            </section>

            <section className="ocr-history">
                <h3 className="ocr-history-title" onClick={toggleResults}>
                    OCR Results {resultsExpanded ? '-' : '+'}
                </h3>
                <div className={`ocr-list ${resultsExpanded ? 'expanded' : ''}`}>
                    {results.length > 0 ? (
                        <ul>
                            {results.map(result => (
                                <li key={result._id} className="ocr-item">
                                    <p><strong>Created At:</strong> {result.createdAt}</p>
                                    <p><strong>Document ID:</strong> {result.documentId}</p>
                                    <p><strong>OCR Text:</strong> {result.ocrText}</p>
                                    <p><strong>Language:</strong> {result.language}</p>
                                    <div className="download-buttons">
                                        <a href={`/downloadResult/txt/${result.documentId}`} download>Download TXT</a>
                                        <a href={`/downloadResult/pdf/${result.documentId}`} download>Download PDF</a>
                                        <a href={`/downloadResult/docx/${result.documentId}`} download>Download DOCX</a>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No OCR results found.</p>
                    )}
                </div>
            </section>

            <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Account;
