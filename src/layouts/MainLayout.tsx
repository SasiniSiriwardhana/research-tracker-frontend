import React from 'react';
import { Outlet } from 'react-router-dom';
import AppNavbar from '../components/layout/AppNavbar';
import { Container } from 'react-bootstrap';

const MainLayout: React.FC = () => (
  <>
    <AppNavbar />
    <main className="main-content py-4">
      <Container>
        <Outlet />
      </Container>
    </main>
    <footer className="app-footer text-center py-3">
      <small className="text-muted">
        &copy; {new Date().getFullYear()} Research Project Tracker — CMJD Final Project
      </small>
    </footer>
  </>
);

export default MainLayout;
