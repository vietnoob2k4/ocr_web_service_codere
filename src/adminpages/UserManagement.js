import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./UserManagement.css"
import { useParams, Navigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice'; // Điều chỉnh đường dẫn đến action logout nếu cần
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
    const { isAuthenticated, userRole } = useSelector(state => state.auth);

    

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/users'); // Đảm bảo đường dẫn này đúng
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
      } catch (err) {
        setError('Error retrieving users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchFilteredUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/users/search', {
          params: { email: searchTerm }
        });
        setFilteredUsers(response.data.users);
      } catch (err) {
        setError('Error retrieving users');
      }
    };

    if (searchTerm) {
      fetchFilteredUsers();
    } else {
      // Nếu không có từ khóa tìm kiếm, hiển thị tất cả người dùng
      setFilteredUsers(users);
    }
    
  }, [searchTerm, users]);
  if (!isAuthenticated || userRole !== 'admin') {
    return <Navigate to="/login" replace />;
}

const handleLogout = () => {
    dispatch(logout()); // Trigger logout action
};

  if (loading) return <p>Loading...</p>;
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
      <h1>User Management</h1>
      <input
        type="text"
        placeholder="Search by email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '20px', padding: '8px', width: '100%', maxWidth: '600px' }} // Thêm style để thanh tìm kiếm rõ ràng hơn
      />
      {filteredUsers.length === 0 ? (
        <p>No users found</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>ID</th>
              <th>Password</th>
              <th>Subscription Type</th>
              <th>Valid Until</th>
              <th>Remaining Uses</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.email}</td>
                <td>{user.userRole}</td>
                <td>{user._id}</td>
                <td>{user.password}</td>
                <td>{user.subscription?.type || 'None'}</td>
                <td>{user.subscription?.validUntil ? new Date(user.subscription.validUntil).toLocaleDateString() : 'N/A'}</td>
                <td>{user.subscription?.remainingUses || 'N/A'}</td>
                <td>
                  <Link to={`/user-details/${user._id}`}>View Details</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagement;
