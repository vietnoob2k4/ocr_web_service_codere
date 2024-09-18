import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/register', { email, password });
            setMessage(response.data.message);

            // Redirect to login page on successful registration
            setTimeout(() => {
                navigate('/login');
            }, 1000);
        } catch (error) {
            setMessage(error.response ? error.response.data.message : 'Registration failed');
        }
    };

    return (
        <div style={containerStyle}>
            <div style={formContainerStyle}>
                <h2 style={headerStyle}>Register</h2>
                <form onSubmit={handleSubmit} style={formStyle}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <button type="submit" style={buttonStyle}>Register</button>
                </form>
                {message && <p style={messageStyle}>{message}</p>}
                <p style={registerStyle}>
                    Already have an account? <Link to="/login" style={linkStyle}>Login now</Link>
                </p>
            </div>
        </div>
    );
};

// Styles
const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5',
};

const formContainerStyle = {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    width: '400px',
};

const headerStyle = {
    marginBottom: '20px',
    fontSize: '24px',
    textAlign: 'center',
    color: '#333',
};

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
};

const inputGroupStyle = {
    marginBottom: '15px',
};

const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    color: '#555',
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    boxSizing: 'border-box',
};

const buttonStyle = {
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#007bff',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
};

const buttonHoverStyle = {
    backgroundColor: '#0056b3',
};

const messageStyle = {
    marginTop: '10px',
    color: '#dc3545',
    textAlign: 'center',
};

const registerStyle = {
    marginTop: '10px',
    textAlign: 'center',
};

const linkStyle = {
    color: '#007bff',
    textDecoration: 'none',
};

export default RegisterPage;
