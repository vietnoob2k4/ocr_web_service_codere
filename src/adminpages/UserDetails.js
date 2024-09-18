import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice'; // Điều chỉnh đường dẫn đến action logout nếu cần

const UserDetails = () => {
  const { userId } = useParams();
  const [results, setResults] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const { isAuthenticated, userRole } = useSelector((state) => state.auth);

  // Kiểm tra quyền truy cập
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Lấy dữ liệu kết quả của người dùng
        const resultsResponse = await axios.get(`http://localhost:8000/getUserResults/${userId}`);
        setResults(resultsResponse.data.results);

        // Lấy dữ liệu thanh toán của người dùng
        const paymentsResponse = await axios.get(`http://localhost:8000/payments/user/${userId}`);
        if (Array.isArray(paymentsResponse.data.payments)) {
          setPayments(
            paymentsResponse.data.payments.map((payment) => ({
              ...payment,
              date: new Date(payment.date).toLocaleDateString(),
            }))
          );
        } else {
          setError('no data');
        }
      } catch (err) {
        setError('no data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);
  if (!isAuthenticated || userRole !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    dispatch(logout()); // Gọi action logout
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>{error}</p>;

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

      <h1>USER DETAILS</h1>

      <div>
        <h2>OCR RESULTS</h2>
        {results.length === 0 ? (
          <p>Không có kết quả nào được tìm thấy</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID </th>
                <th>RESULTS</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result._id}>
                  <td>{result._id}</td>
                  <td>{result.ocrText}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <h2>PAYMENT</h2>
        {payments.length === 0 ? (
          <p>Không có giao dịch thanh toán nào được tìm thấy</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID </th>
                <th>AMOUNT</th>
                <th>DATE</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td>{payment._id}</td>
                  <td>{payment.amount} $</td>
                  <td>{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
