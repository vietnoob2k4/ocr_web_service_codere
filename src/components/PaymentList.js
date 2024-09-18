import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PaymentDetail from './PaymentDetail';

const PaymentList = () => {
    const [payments, setPayments] = useState([]);

    const fetchPayments = async () => {
        try {
            const response = await axios.get('http://localhost:8000/payments');
            setPayments(response.data.payments);
        } catch (error) {
            console.error("Error fetching payments:", error);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    return (
        <div>
            <h2>Payment List</h2>
            <ul>
                {payments.map(payment => (
                    <PaymentDetail key={payment._id} payment={payment} fetchPayments={fetchPayments} />
                ))}
            </ul>
        </div>
    );
};

export default PaymentList;
