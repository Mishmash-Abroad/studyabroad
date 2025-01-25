/**
 * Study Abroad Program - Login Modal Component
 * =============================================
 * 
 * Modal component for user authentication that provides:
 * - Username/password login form
 * - Error handling and validation
 * - Smooth transitions and animations
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';
import {
  ModalOverlay,
  ModalContainer,
  ModalCloseButton,
  ModalTitle,
  ModalForm,
  FormInput,
  FormButton,
  FormError,
} from './styled';

const LoginModal = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/login/', {
        username,
        password,
      });
      
      if (response.data.token) {
        const { token, ...userData } = response.data;
        login(userData, token);
        onClose();
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalCloseButton onClick={onClose}>×</ModalCloseButton>
        <ModalTitle>Welcome Back</ModalTitle>
        
        <ModalForm onSubmit={handleSubmit}>
          <FormInput
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          
          <FormInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && <FormError>{error}</FormError>}
          
          <FormButton type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </FormButton>
        </ModalForm>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default LoginModal;
