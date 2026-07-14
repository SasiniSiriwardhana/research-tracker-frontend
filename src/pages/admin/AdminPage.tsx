import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, Badge, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { getAllUsers, deleteUser } from '../../services/userService';
import { getAllProjects } from '../../services/projectService';
import { UserDTO, ProjectDTO } from '../../interfaces';
import Spinner from '../../components/common/Spinner';
import AlertMessage from '../../components/common/AlertMessage';
import StatusBadge from '../../components/common/StatusBadge';
import { Link } from 'react-router-dom';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'danger', PI: 'warning', MEMBER: 'info', VIEWER: 'secondary',
};

const AdminPage: React.FC = () => {
  const [users, setUsers]       = useState<UserDTO[]>([]);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, p] = await Promise.all([getAllUsers(), getAllProjects()]);
      setUsers(u);
      setProjects(p);
    } catch {
      setError('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await deleteUser(id);
      setSuccess('User deleted.');
      load();
    } catch {
      setError('Delete failed.');
    }
  };

  // Summary stats
  const stats = {
    users:    users.length,
    admins:   users.filter((u) => u.role === 'ADMIN').length,
    pis:      users.filter((u) => u.role === 'PI').length,
    members:  users.filter((u) => u.role === 'MEMBER').length,
    viewers:  users.filter((u) => u.role === 'VIEWER').length,
    projects: projects.length,
    active:   projects.filter((p) => p.status === 'ACTIVE').length,
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">🛡️ Admin Panel</h1>
        <Badge bg="danger" className="fs-6">ADMIN ONLY</Badge>
      </div>

      <AlertMessage message={error}   variant="danger"  onClose={() => setError(null)} />
      <AlertMessage message={success} variant="success" onClose={() => setSuccess(null)} />

      {/* Summary stats */}
      {!loading && (
        <Row className="g-3 mb-4">
          {[
            { label: 'Total Users',    value: stats.users,    color: '#4f46e5', icon: '👥' },
            { label: 'Total Projects', value: stats.projects, color: '#0ea5e9', icon: '📁' },
            { label: 'Active Projects', value: stats.active,  color: '#16a34a', icon: '🚀' },
            { label: 'Admins',         value: stats.admins,   color: '#dc2626', icon: '🛡️' },
          ].map((s) => (
            <Col key={s.label} xs={6} xl={3}>
              <div className="stat-card d-flex justify-content-between align-items-center"
                   style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)` }}>
                <div>
                  <div className="stat-number">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
                <div className="stat-icon">{s.icon}</div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      <Tabs defaultActiveKey="users" className="mb-3">
        {/* ── Users Tab ── */}
        <Tab eventKey="users" title={`Users (${users.length})`}>
          <Card>
            <Card.Body className="p-0">
              {loading ? <Spinner /> : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>ID</th><th>Full Name</th><th>Username</th>
                        <th>Role</th><th>Created</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td className="text-muted" style={{ fontSize: '0.8rem' }}>{u.id.substring(0, 8)}…</td>
                          <td className="fw-semibold">{u.fullName}</td>
                          <td>{u.username}</td>
                          <td>
                            <Badge bg={ROLE_COLORS[u.role] ?? 'secondary'}>{u.role}</Badge>
                          </td>
                          <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* ── Projects Tab ── */}
        <Tab eventKey="projects" title={`All Projects (${projects.length})`}>
          <Card>
            <Card.Body className="p-0">
              {loading ? <Spinner /> : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr><th>Title</th><th>PI</th><th>Status</th><th>Start</th><th>End</th><th></th></tr>
                    </thead>
                    <tbody>
                      {projects.map((p) => (
                        <tr key={p.id}>
                          <td className="fw-semibold">{p.title}</td>
                          <td>{p.piName || '—'}</td>
                          <td><StatusBadge status={p.status} /></td>
                          <td>{p.startDate ?? '—'}</td>
                          <td>{p.endDate   ?? '—'}</td>
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
        </Tab>
      </Tabs>
    </div>
  );
};

export default AdminPage;
