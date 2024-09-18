// authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    token: localStorage.getItem('token') || null,
    userId: localStorage.getItem('userId') || null,
    email: localStorage.getItem('email') || null,
    userRole: localStorage.getItem('userRole') || null,
    isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action) {
            const { token, userId, email, userRole } = action.payload;
            state.token = token;
            state.userId = userId;
            state.email = email;
            state.userRole = userRole;

            state.isAuthenticated = true;
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            localStorage.setItem('email', email);
            localStorage.setItem('userRole', userRole);
        },
        logout(state) {
            state.token = null;
            state.userId = null;
            state.email = null;
            state.userRole = null;

            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('email');
            localStorage.removeItem('userRole');
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
