import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllProjects } from '../../services/projectService';
import { ProjectDTO } from '../../interfaces';
import Spinner from '../../components/common/Spinner';
import AlertMessage from '../../components/common/AlertMessage';
import StatusBadge from '../../components/common/StatusBadge';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllProjects()
      .then(setProjects)
      .catch(() => setError('Could not load projects.'))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total:     projects.length,
    active:    projects.filter((p) => p.status === 'ACTIVE').length,
    completed: projects.filter((p) => p.status === 'COMPLETED').length,
    planning:  projects.filter((p) => p.status === 'PLANNING').length,
  };

  const recent = [...projects]
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 5);

  return (
    <div className="fade-in">
      {/* Welcome header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.username} ✨</h1>
          <p className="text-muted mt-1 mb-0">Here's what's happening with your research portfolio today.</p>
        </div>
        <div>
          <Link to="/projects/new" className="btn btn-primary shadow-sm">
            + New Project
          </Link>
        </div>
      </div>

      <AlertMessage message={error} onClose={() => setError(null)} />

      {/* Stat cards */}
      <Row className="g-4 mb-5">
        {[
          { label: 'Total Projects', value: counts.total,     color: '#6366f1', bg: '#eef2ff', icon: '✦' },
          { label: 'Active',         value: counts.active,    color: '#10b981', bg: '#d1fae5', icon: '🚀' },
          { label: 'Completed',      value: counts.completed, color: '#3b82f6', bg: '#dbeafe', icon: '✓' },
          { label: 'Planning',       value: counts.planning,  color: '#f59e0b', bg: '#fef3c7', icon: '◎' },
        ].map((stat) => (
          <Col key={stat.label} xs={12} sm={6} xl={3}>
            <div className="stat-card-modern">
              <div className="stat-icon-wrapper" style={{ backgroundColor: stat.bg, color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-info">
                <div className="stat-label-modern">{stat.label}</div>
                <div className="stat-number-modern">{loading ? '—' : stat.value}</div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Recent projects */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
        <Card.Header className="bg-white border-bottom-0 pt-4 pb-3 px-4 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h5>
          <Link to="/projects" className="btn btn-sm btn-light" style={{ fontWeight: 600, color: 'var(--primary)' }}>
            View All Projects
          </Link>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="py-5 text-center"><Spinner /></div>
          ) : recent.length === 0 ? (
            <div className="py-5 text-center text-muted">
              <div style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }}>📭</div>
              No projects found in the system.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th className="px-4">Project Title</th>
                    <th>Lead Investigator</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th className="text-end px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 fw-semibold">{p.title}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle bg-light d-flex align-items-center justify-content-center text-muted" style={{ width: '28px', height: '28px', fontSize: '0.7rem' }}>
                            {p.piName ? p.piName.substring(0, 2).toUpperCase() : 'NA'}
                          </div>
                          {p.piName || 'Unassigned'}
                        </div>
                      </td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>{p.startDate ? new Date(p.startDate).toLocaleDateString() : '—'}</td>
                      <td className="text-end px-4">
                        <Link to={`/projects/${p.id}`} className="btn btn-sm btn-light text-primary" style={{ fontWeight: 500 }}>
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default DashboardPage;
