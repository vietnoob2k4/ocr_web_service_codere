import React, { useState } from 'react';
import axios from 'axios';

const PaymentForm = ({ fetchPayments, payment }) => {
    const [formData, setFormData] = useState({
        userId: payment?.userId || '',
        amount: payment?.amount || '',
        paymentMethod: payment?.paymentMethod || '',
        subscriptionType: payment?.subscriptionType || '',
        status: payment?.status || 'successful',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (payment) {
                await axios.put(`http://172.17.152.234:8000/payments/${payment._id}`, formData);
            } else {
                await axios.post('http://172.17.152.234:8000/payments', formData);
            }
            fetchPayments();
        } catch (error) {
            console.error("Error submitting payment:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="userId" placeholder="User ID" value={formData.userId} onChange={handleChange} required />
            <input type="number" name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} required />
            <input type="text" name="paymentMethod" placeholder="Payment Method" value={formData.paymentMethod} onChange={handleChange} required />
            <input type="text" name="subscriptionType" placeholder="Subscription Type" value={formData.subscriptionType} onChange={handleChange} required />
            <select name="status" value={formData.status} onChange={handleChange} required>
                <option value="successful">Successful</option>
                <option value="failed">Failed</option>
            </select>
            <button type="submit">Submit</button>
        </form>
    );
};

export default PaymentForm;
