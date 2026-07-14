import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { register as registerApi } from '../../services/authService';
import AlertMessage from '../../components/common/AlertMessage';

const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '', fullName: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setApiError(null);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!form.username.trim()) {
      newErrors.username = 'Username is required.';
    } else if (form.username.length < 3 || form.username.length > 100) {
      newErrors.username = 'Username must be 3–100 characters.';
    }
    if (!form.password) {
      newErrors.password = 'Password is required.';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    if (form.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await registerApi(form);
      login(data.token, data.userId, data.username, data.role);
      navigate('/dashboard');
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">🔬</div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join Research Tracker today</p>

        <AlertMessage message={apiError} onClose={() => setApiError(null)} />

        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3" controlId="reg-fullName">
            <Form.Label className="fw-semibold">Full Name</Form.Label>
            <Form.Control
              type="text"
              name="fullName"
              placeholder="Dr. Jane Smith"
              value={form.fullName}
              onChange={handleChange}
              isInvalid={!!errors.fullName}
              autoFocus
            />
            <Form.Control.Feedback type="invalid">{errors.fullName}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="reg-username">
            <Form.Label className="fw-semibold">Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder="jsmith"
              value={form.username}
              onChange={handleChange}
              isInvalid={!!errors.username}
            />
            <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="reg-password">
            <Form.Label className="fw-semibold">Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4" controlId="reg-confirm-password">
            <Form.Label className="fw-semibold">Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              isInvalid={!!errors.confirmPassword}
            />
            <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
          </Form.Group>

          <Button
            type="submit"
            variant="primary"
            className="w-100"
            disabled={loading}
            id="register-submit-btn"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Creating account…
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </Form>

        <p className="text-center mt-3 mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" className="fw-semibold text-decoration-none">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
