import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const PurchaseService = () => {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const { token, isAuthenticated, userId } = useSelector(state => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || !token) {
            navigate('/login');
        } else {
            axios.get('http://localhost:8000/user', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => {
                setUserData(response.data);
                console.log('User data fetched:', response.data);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                navigate('/login');
            });
        }
    }, [isAuthenticated, token, navigate]);

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handlePurchase = async () => {
        if (!selectedPlan) {
            setPaymentStatus('Please select a plan');
            return;
        }
    
        if (!userId) {
            setPaymentStatus('User ID is missing');
            console.error('User ID is missing:', userId);
            return;
        }
    
        setLoading(true);
        try {
            const paymentDetails = {
                userId,
                amount: selectedPlan === 'monthly' ? 10 : 1,
                paymentMethod: 'Credit Card',
                subscriptionType: selectedPlan,
                status: 'successful'
            };
    
            const response = await axios.post('http://localhost:8000/payments', paymentDetails, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
    
            setPaymentStatus(response.data.message);
        } catch (error) {
            console.error('Purchase error:', error);
            setPaymentStatus('YOU ARE ALREADY SUBSCRIBE FOR MONTHY PASS');
        } finally {
            setLoading(false);
        }
    };

    const handleContainerClick = (e) => {
        // Nếu nhấn ra ngoài các gói, thoát chế độ focus
        if (e.target === e.currentTarget) {
            setSelectedPlan(null);
        }
    };

    return (
        <div style={containerStyle(selectedPlan)} onClick={handleContainerClick}>
            <header style={headerStyle}>
            <button
                    onClick={handleGoBack}
                    style={goBackButtonStyle}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'blue'} // Thay đổi màu khi hover
                    onMouseLeave={(e) => e.currentTarget.style.color = 'black'} // Khôi phục màu khi không hover
                >
                RETURN
                </button>
                <h2 style={titleStyle}>Purchase OCR Service</h2>
            </header>
            <div style={planSectionStyle}>
                <div 
                    style={selectedPlan === 'monthly' ? selectedPlanContainerStyle : planContainerStyle}
                    onClick={(e) => { e.stopPropagation(); handleSelectPlan('monthly'); }} // Dừng sự kiện click từ phần tử cha
                >
                    <div style={planContentStyle}>
                        <h3 style={planTitleStyle}>Monthly Subscription</h3>
                        <p style={planPriceStyle}>$10/month</p>
                        <hr style={dividerStyle} />
                        <p style={planDescriptionStyle}>Access all features for a month. You pay a fixed monthly fee for a certain amount of OCR processing power. This is ideal if you have a consistent workload and need predictable costs.</p>
                    </div>
                </div>
                <div 
                    style={selectedPlan === 'per_use' ? selectedPlanContainerStyle : planContainerStyle}
                    onClick={(e) => { e.stopPropagation(); handleSelectPlan('per_use'); }} // Dừng sự kiện click từ phần tử cha
                >
                    <div style={planContentStyle}>
                        <h3 style={planTitleStyle}>Pay Per Use</h3>
                        <p style={planPriceStyle}>$1/use</p>
                        <hr style={dividerStyle} />
                        <p style={planDescriptionStyle}>Pay only for what you use. You pay only for the OCR processing you actually use. This is great for occasional or unpredictable workloads, as you only pay for what you need.</p>
                    </div>
                </div>
            </div>
            <div style={summarySectionStyle}>
                <h3 style={selectedPlanStyle}>
                    Selected Plan: {selectedPlan ? selectedPlan : 'None'}
                </h3>
                <button style={purchaseButtonStyle} onClick={handlePurchase} disabled={loading}>
                    {loading ? 'Processing...' : 'Purchase'}
                </button>
            </div>
            {paymentStatus && <p style={statusStyle}>{paymentStatus}</p>}
        </div>
    );
};

// Styles
const containerStyle = (selectedPlan) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: selectedPlan ? 'rgba(0, 0, 0, 0.8)' : '#f4f4f9',
    minHeight: '100vh',
    transition: 'background-color 0.3s ease',
});

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: '10px',
    borderBottom: '1px solid #ccc',
    marginBottom: '20px',
};

const goBackButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'black',
    cursor: 'pointer',
    fontSize: '16px',
};
const goBackButtonHoverStyle = {
    ...goBackButtonStyle,
    color: 'blue', // Màu thay đổi khi hover
};

const titleStyle = {
    marginBottom: '20px',
    fontSize: '24px',
    color: '#333',
};

const planSectionStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '20px',
};

const planContainerStyle = {
    width: '300px',
    height: '650px',
    overflow: 'hidden',
    borderRadius: '5px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
};

const selectedPlanContainerStyle = {
    ...planContainerStyle,
    transform: 'scale(1.1)',
    boxShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.4)', // Hiệu ứng phát sáng nhiều lớp
    zIndex: 10,
};


const planContentStyle = {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
};

const planTitleStyle = {
    fontSize: '18px',
    color: '#333',
    marginBottom: '5px',
};

const planPriceStyle = {
    fontSize: '16px',
    color: '#555',
    marginBottom: '5px',
};

const dividerStyle = {
    width: '80%',
    border: 'none',
    borderTop: '1px solid #ccc',
    margin: '10px 0',
};

const planDescriptionStyle = {
    fontSize: '16px',
    color: '#777',
};

const summarySectionStyle = {
    textAlign: 'center',
    marginBottom: '20px',
};

const selectedPlanStyle = {
    marginBottom: '10px',
    fontSize: '18px',
    color: '#333',
};

const purchaseButtonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
};

const statusStyle = {
    marginTop: '20px',
    fontSize: '16px',
    color: '#dc3545',
};

export default PurchaseService;
