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
    <div className="auth-page-container">
      {/* Left side: branding and illustration area */}
      <div className="auth-left-pane d-none d-md-flex">
        <div style={{ zIndex: 1, textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
            Welcome to <br /> Research Portal
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
            A powerful platform to manage, track, and collaborate on cutting-edge research projects.
          </p>
        </div>
      </div>

      {/* Right side: login form */}
      <div className="auth-right-pane">
        <div className="auth-card-modern">
          <div className="text-center">
            <span className="auth-logo-modern">✦</span>
            <h1 className="auth-title-modern">Sign In</h1>
            <p className="auth-subtitle-modern">Access your dashboard</p>
          </div>

          <AlertMessage message={error} onClose={() => setError(null)} />

          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3" controlId="login-username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="e.g. johndoe"
                value={form.username}
                onChange={handleChange}
                autoFocus
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="login-password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              className="w-100 mb-3"
              disabled={loading}
              id="login-submit-btn"
              style={{ padding: '0.75rem' }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Authenticating...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </Button>
          </Form>

          <div className="text-center mt-4">
            <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
              Don't have an account yet?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
