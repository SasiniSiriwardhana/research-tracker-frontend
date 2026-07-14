import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../services/authService';
import AlertMessage from '../../components/common/AlertMessage';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError('Username and password are required.');
      return;
    }
    setLoading(true);
    try {
      const data = await loginApi(form);
      login(data.token, data.userId, data.username, data.role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Login failed. Check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">🔬</div>
        <h1 className="auth-title">Research Tracker</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        <AlertMessage message={error} onClose={() => setError(null)} />

        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3" controlId="login-username">
            <Form.Label className="fw-semibold">Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder="Enter username"
              value={form.username}
              onChange={handleChange}
              autoFocus
              required
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="login-password">
            <Form.Label className="fw-semibold">Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button
            type="submit"
            variant="primary"
            className="w-100"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </Form>

        <p className="text-center mt-3 mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <Link to="/register" className="fw-semibold text-decoration-none">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
