import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { logout } from '../redux/authSlice';
import { Navigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import './FinancialManagement.css';

const FinancialManagement = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, userRole } = useSelector(state => state.auth);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get("http://localhost:8000/payments");
        setPayments(response.data.payments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleEmailSearch = async (e) => {
    e.preventDefault();
    try {
        if (!searchEmail) {
            const paymentsResponse = await axios.get("http://localhost:8000/payments");
            setPayments(paymentsResponse.data.payments);
        } else {
            const userResponse = await axios.get("http://localhost:8000/get-userid-by-email", {
                params: { email: searchEmail }
            });

            const userId = userResponse.data.userId;

            const paymentsResponse = await axios.get(`http://localhost:8000/payments/user/${userId}`);
            setPayments(paymentsResponse.data.payments);
        }
    } catch (err) {
        console.error("Error fetching payments:", err.response ? err.response.data : err.message);
        setError(err.response ? err.response.data.message : err.message);
    }
  };

  const handleDateRangeSearch = async (e) => {
    e.preventDefault();

    try {
      if (!startDate && !endDate) {
        const response = await axios.get("http://localhost:8000/payments");
        setPayments(response.data.payments);
      } else if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
          throw new Error("End date cannot be earlier than start date.");
        }

        end.setHours(23, 59, 59, 999);

        const response = await axios.get("http://localhost:8000/payment/date-range", {
          params: { startDate: start.toISOString(), endDate: end.toISOString() }
        });

        setPayments(response.data.payments);
        setTotalAmount(response.data.totalEarned);
      } else {
        setError("Both startDate and endDate are required or leave them empty to get all payments.");
      }

      setError('');
    } catch (err) {
      console.error("Error fetching payments by date range:", err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.message : err.message);
    }
  };

  if (!isAuthenticated || userRole !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div>
      <header className="admin-header">
        <nav className="admin-nav">
          <ul className="nav-list">
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/usermanagement">User Management</Link></li>
            <li><Link to="/financialmanagement">Financial Management</Link></li>
            <li><Link to="/feedback">Feedback</Link></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </ul>
          <div className="header-message">
            You are an admin
          </div>
        </nav>
      </header>
      <main>
        <h1>Financial Management</h1>
        <form className="search-form" onSubmit={handleEmailSearch}>
          <div className="search-row">
            <label>
              Email:
              <input 
                type="email" 
                value={searchEmail} 
                onChange={(e) => setSearchEmail(e.target.value)} 
              />
            </label>
            <button type="submit">Search by Email</button>
          </div>
        </form>
        <form className="search-form" onSubmit={handleDateRangeSearch}>
          <div className="search-row">
            <label>
              Start Date:
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </label>
            <label>
              End Date:
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </label>
            <button type="submit">Search by Date Range</button>
          </div>
        </form>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : payments.length > 0 ? (
          <div className="results-container">
          <div class="totalamount">
          <p>Total earned: ${totalAmount} from {startDate} to {endDate}</p>

          </div>
            {payments.map(payment => (
              <div className="result-card" key={payment._id}>
                <p className="itemcard"><strong>Email:</strong> {payment.userId.email}</p>
                <p className="itemcard"><strong>Amount:</strong> ${payment.amount}</p>
                <p className="itemcard"><strong>Transaction ID:</strong> {payment._id}</p>
                <p className="itemcard"><strong>Date:</strong> {new Date(payment.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No payments found.</p>
        )}
      </main>
    </div>
  );
}

export default FinancialManagement;
