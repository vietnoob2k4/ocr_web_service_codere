// components/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet, Link, useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice'; // Adjust the path to your actual logout action
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { token, isAuthenticated, userRole } = useSelector(state => state.auth);
    const [userData, setUserData] = useState(null);
    const [userCount, setUserCount] = useState(null);
    const [paymentCount, setPaymentCount] = useState(null);
    const [resultsCount, setResultsCount] = useState(null);
    const [totalPayment, setTotalPayment] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || !token) {
            navigate('/login');
        } else {
            // Fetch user data
            axios.get('http://localhost:8000/user', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => {
                navigate('/login');
            });

            // Fetch user count
            axios.get('http://localhost:8000/userscount', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => {
                setUserCount(response.data.count);
            })
            .catch(error => {
                console.error('Error fetching user count:', error);
            });

            // Fetch payment count
            axios.get('http://localhost:8000/paymentscount', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => {
                setPaymentCount(response.data.count);
            })
            .catch(error => {
                console.error('Error fetching payment count:', error);
            });

            // Fetch results count
            axios.get('http://localhost:8000/resultscount', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => {
                setResultsCount(response.data.count);
            })
            .catch(error => {
                console.error('Error fetching results count:', error);
            });

            // Fetch total payment
            axios.get('http://localhost:8000/totalpayment', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => {
                setTotalPayment(response.data.totalAmount);
            })
            .catch(error => {
                console.error('Error fetching total payment:', error);
            });
        }
    }, [isAuthenticated, token, navigate]);

    if (!isAuthenticated || userRole !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        dispatch(logout()); // Trigger logout action
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
                        {userData ? userData.email : 'Loading...'} - You are an admin
                    </div>
                </nav>
            </header>
            <main>
                <Outlet />
                <div className="dashboard-container">
                    <div className="dashboard-box">
                        <h3>Total Users</h3>
                        <p>{userCount !== null ? userCount : 'Loading...'}</p>
                    </div>
                    <div className="dashboard-box">
                        <h3>Total OCR PROCESS</h3>
                        <p>{resultsCount !== null ? resultsCount : 'Loading...'}</p>
                    </div>
                    <div className="dashboard-box">
                        <h3>Total Payments</h3>
                        <p>{paymentCount !== null ? paymentCount : 'Loading...'}</p>
                        <h3>Total Payment Amount</h3>
                        <p>${totalPayment !== null ? totalPayment.toFixed(2) : 'Loading...'}</p>
                    </div>
                    
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
