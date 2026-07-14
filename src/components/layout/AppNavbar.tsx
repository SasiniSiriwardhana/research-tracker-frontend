import React from 'react';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'danger',
  PI: 'warning',
  MEMBER: 'info',
  VIEWER: 'secondary',
};

const AppNavbar: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className="app-navbar shadow-sm" sticky="top">
      <Container>
        {/* Brand */}
        <Navbar.Brand as={NavLink} to="/dashboard" className="fw-bold fs-5 brand-text">
          <span className="brand-icon me-2">🔬</span>
          Research Tracker
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />

        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/dashboard" end>
              Dashboard
            </Nav.Link>
            <Nav.Link as={NavLink} to="/projects">
              Projects
            </Nav.Link>
            {/* Milestones and Documents are accessed through project details */}
            {/* Admin-only menu item */}
            {hasRole('ADMIN') && (
              <Nav.Link as={NavLink} to="/admin" className="text-danger fw-semibold">
                Admin Panel
              </Nav.Link>
            )}
          </Nav>

          {/* User info + logout */}
          <Nav className="align-items-center gap-2">
            {user && (
              <>
                <span className="navbar-text me-2">
                  <span className="fw-semibold text-light">{user.username}</span>
                  <Badge
                    bg={ROLE_COLOR[user.role] ?? 'secondary'}
                    className="ms-2 role-badge"
                  >
                    {user.role}
                  </Badge>
                </span>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                  id="logout-btn"
                >
                  Logout
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
