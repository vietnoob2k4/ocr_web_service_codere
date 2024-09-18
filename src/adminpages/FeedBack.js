import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice'; // Điều chỉnh đường dẫn tới action logout của bạn
import axios from 'axios';
import './Feedback.css';

const Feedback = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, userRole } = useSelector(state => state.auth);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        if (isSearching) {
          // Fetch feedbacks based on time range
          const response = await axios.get("http://localhost:8000/feedback/time-range", {
            params: { startDate, endDate }
          });
          setFeedbacks(response.data.feedbacks);
        } else {
          // Fetch all feedbacks
          const response = await axios.get("http://localhost:8000/feedback");
          setFeedbacks(response.data.feedbacks);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [isSearching, startDate, endDate]);

  if (!isAuthenticated || userRole !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleSearch = () => {
    setIsSearching(true);
    setLoading(true);
  };

  const handleResetSearch = () => {
    setStartDate('');
    setEndDate('');
    setIsSearching(false);
    setLoading(true);
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
        <h1>Feedbacks</h1>
        <div className="date-picker">
          <label>
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isSearching}
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isSearching}
            />
          </label>
          <button onClick={handleSearch} disabled={isSearching}>Search</button>
          {isSearching && <button onClick={handleResetSearch}>Reset Search</button>}
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : feedbacks.length > 0 ? (
          <div className="feedback-list">
            {feedbacks.map(feedback => (
              <div className="feedback-item" key={feedback._id}>
                <p className="feedback-content"><strong>Email:</strong> {feedback.userId.email}</p>
                <p className="feedback-content"><strong>Content: </strong>{feedback.content}</p>
                <p className="feedback-content"><strong>Uploaded At:</strong> {new Date(feedback.uploadedAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No feedbacks found.</p>
        )}
      </main>
    </div>
  );
};

export default Feedback;
