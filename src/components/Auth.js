import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../App';
import { api } from '../utils';

export const Login = () => {
  const [credentials, setCredentials] = useState({ nickname: '', password: '' });
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await api.login(credentials);
      login(data);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      setError('Неверные данные');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await api.request('/request-password-reset', {
        method: 'POST',
        body: JSON.stringify({ nickname: resetEmail })
      });
      setSuccess('Ссылка отправлена на почту');
      setResetEmail('');
    } catch (error) {
      setError('Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Events Gambit</h2>
        {!resetMode ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nickname"
              value={credentials.nickname}
              onChange={(e) => setCredentials(prev => ({ ...prev, nickname: e.target.value }))}
              required
            />
            <input
              type="password"
              placeholder="Пароль"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="reset-form">
            <input
              type="text"
              placeholder="Никнейм для восстановления"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Отправка...' : 'Восстановить'}
            </button>
          </form>
        )}
        
        <button className="link-btn" onClick={() => {
          setResetMode(!resetMode);
          setError('');
          setSuccess('');
        }}>
          {resetMode ? '← Назад к входу' : 'Забыли пароль?'}
        </button>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
      </div>
    </div>
  );
};

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await api.request(`/reset-password/${token}`, {
        method: 'POST',
        body: JSON.stringify({ newPassword: password })
      });
      setSuccess('Пароль успешно изменен');
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      setError('Ошибка сброса пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Новый пароль</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Новый пароль (мин. 6 символов)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
          />
          <input
            type="password"
            placeholder="Повторите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Сохранение...' : 'Изменить пароль'}
          </button>
        </form>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
      </div>
    </div>
  );
};
