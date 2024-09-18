import React from 'react';
import axios from 'axios';
import PaymentForm from './PaymentForm';

const PaymentDetail = ({ payment, fetchPayments }) => {

    const deletePayment = async () => {
        try {
            await axios.delete(`http://172.17.152.234:8000/payments/${payment._id}`);
            fetchPayments();
        } catch (error) {
            console.error("Error deleting payment:", error);
        }
    };

    return (
        <li>
            <div>
                <p>User ID: {payment.userId}</p>
                <p>Amount: {payment.amount}</p>
                <p>Payment Method: {payment.paymentMethod}</p>
                <p>Subscription Type: {payment.subscriptionType}</p>
                <p>Status: {payment.status}</p>
                <button onClick={deletePayment}>Delete</button>
            </div>
            <PaymentForm fetchPayments={fetchPayments} payment={payment} />
        </li>
    );
};

export default PaymentDetail;
