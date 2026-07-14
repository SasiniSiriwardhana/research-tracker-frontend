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
      <div className="mb-4">
        <h1 className="page-title">Welcome back, {user?.username} 👋</h1>
        <p className="text-muted">Here's an overview of the research portfolio.</p>
      </div>

      <AlertMessage message={error} onClose={() => setError(null)} />

      {/* Stat cards */}
      <Row className="g-3 mb-4">
        {[
          { label: 'Total Projects', value: counts.total,     color: '#4f46e5', icon: '📁' },
          { label: 'Active',         value: counts.active,    color: '#16a34a', icon: '🚀' },
          { label: 'Completed',      value: counts.completed, color: '#0ea5e9', icon: '✅' },
          { label: 'Planning',       value: counts.planning,  color: '#d97706', icon: '📋' },
        ].map((stat) => (
          <Col key={stat.label} xs={12} sm={6} xl={3}>
            <div className="stat-card d-flex justify-content-between align-items-center"
                 style={{ background: `linear-gradient(135deg, ${stat.color}, ${stat.color}cc)` }}>
              <div>
                <div className="stat-number">{loading ? '—' : stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
              <div className="stat-icon">{stat.icon}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Recent projects */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Recent Projects</span>
          <Link to="/projects" className="btn btn-sm btn-outline-primary">View All</Link>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <Spinner />
          ) : recent.length === 0 ? (
            <p className="text-muted text-center py-4">No projects found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>PI</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((p) => (
                    <tr key={p.id}>
                      <td className="fw-semibold">{p.title}</td>
                      <td>{p.piName || '—'}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>{p.startDate ?? '—'}</td>
                      <td>
                        <Link to={`/projects/${p.id}`} className="btn btn-sm btn-outline-secondary">
                          View
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
