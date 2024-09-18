import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PaymentPage from '../pages/PaymentPage';
import LoginPage from '../authpages/LoginPage';
import RegisterPage from '../authpages/RegisterPage';
import Account from '../pages/Account';
import Home from '../pages/Home';
import PurchaseService from '../pages/PurchaseService';
import AdminDashboard from '../adminpages/AdminDashboard';
import UserManagement from '../adminpages/UserManagement';
import Feedback from '../adminpages/FeedBack';
import FinancialManagement from '../adminpages/FinancialManagement';
import UserDetails from '../adminpages/UserDetails'
const Navigator = () => {
    return (
        <Router>
            <Routes>
                <Route path="/payments" element={<PaymentPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/account" element={<Account />} />
                <Route path="/home" element={<Home />} />
                <Route path="/purchase" element={<PurchaseService/>}/>
                {/*admin pages*/}
                <Route path="/dashboard" element={<AdminDashboard/>}/>
                <Route path="/usermanagement" element={<UserManagement/>} />
                <Route path='/feedback' element={<Feedback/>}/>
                <Route path='/financialmanagement' element={<FinancialManagement/>}/>
                <Route path="/user-details/:userId" element={<UserDetails />} />


                
                {/* Route mặc định */}
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
};

export default Navigator;
