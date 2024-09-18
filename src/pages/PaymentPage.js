
import React from 'react'
import PaymentForm from '../components/PaymentForm'
import PaymentList from '../components/PaymentList'

const PaymentPage = () => {
  return (
    <div>
        <h1> payment page</h1>
        <PaymentForm fetchPayments={() => {}}/>
        <PaymentList/>
    </div>
    
  )
}

export default PaymentPage

