import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Modal, Form, Row, Col } from 'react-bootstrap';
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
} from '../../services/projectService';
import { ProjectDTO, ProjectStatus } from '../../interfaces';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import AlertMessage from '../../components/common/AlertMessage';
import StatusBadge from '../../components/common/StatusBadge';

const STATUS_OPTIONS: ProjectStatus[] = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'];

const EMPTY_FORM: Partial<ProjectDTO> = {
  title: '', summary: '', status: 'PLANNING', piId: '', tags: '', startDate: '', endDate: '',
};

const ProjectsPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ProjectDTO | null>(null);
  const [form, setForm] = useState<Partial<ProjectDTO>>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProjects(await getAllProjects());
    } catch {
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, piId: user?.userId ?? '' });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (p: ProjectDTO) => {
    setEditTarget(p);
    setForm({ ...p });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title?.trim()) errs.title = 'Title is required.';
    if (!form.status)        errs.status = 'Status is required.';
    if (!form.piId?.trim()) errs.piId = 'PI ID is required.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editTarget) {
        await updateProject(editTarget.id!, form as ProjectDTO);
        setSuccess('Project updated successfully.');
      } else {
        await createProject(form as ProjectDTO);
        setSuccess('Project created successfully.');
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    try {
      await deleteProject(id);
      setSuccess('Project deleted.');
      load();
    } catch {
      setError('Delete failed.');
    }
  };

  const handleStatusChange = async (id: string, status: ProjectStatus) => {
    try {
      await updateProjectStatus(id, status);
      setSuccess('Status updated.');
      load();
    } catch {
      setError('Status update failed.');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        {hasRole('ADMIN', 'PI') && (
          <Button variant="primary" onClick={openCreate} id="create-project-btn">
            + New Project
          </Button>
        )}
      </div>

      <AlertMessage message={error}   variant="danger"  onClose={() => setError(null)} />
      <AlertMessage message={success} variant="success" onClose={() => setSuccess(null)} />

      {loading ? <Spinner /> : (
        <Card>
          <Card.Body className="p-0">
            {projects.length === 0 ? (
              <p className="text-center text-muted py-5">No projects found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Title</th><th>PI</th><th>Status</th>
                      <th>Start</th><th>End</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr key={p.id}>
                        <td className="fw-semibold">
                          <Link to={`/projects/${p.id}`} className="text-decoration-none">
                            {p.title}
                          </Link>
                        </td>
                        <td>{p.piName || '—'}</td>
                        <td>
                          {hasRole('ADMIN', 'PI') ? (
                            <Form.Select
                              size="sm"
                              value={p.status}
                              onChange={(e) => handleStatusChange(p.id!, e.target.value as ProjectStatus)}
                              style={{ width: 'auto' }}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s.replace('_', ' ')}</option>
                              ))}
                            </Form.Select>
                          ) : (
                            <StatusBadge status={p.status} />
                          )}
                        </td>
                        <td>{p.startDate ?? '—'}</td>
                        <td>{p.endDate   ?? '—'}</td>
                        <td>
                          <div className="d-flex gap-1 flex-wrap">
                            <Link to={`/projects/${p.id}`} className="btn btn-sm btn-outline-secondary">
                              Details
                            </Link>
                            {hasRole('ADMIN', 'PI') && (
                              <Button size="sm" variant="outline-primary" onClick={() => openEdit(p)}>
                                Edit
                              </Button>
                            )}
                            {hasRole('ADMIN') && (
                              <Button size="sm" variant="outline-danger" onClick={() => handleDelete(p.id!)}>
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Create / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editTarget ? 'Edit Project' : 'New Project'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group controlId="proj-title">
                <Form.Label className="fw-semibold">Title *</Form.Label>
                <Form.Control
                  value={form.title ?? ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  isInvalid={!!formErrors.title}
                  placeholder="Research project title"
                />
                <Form.Control.Feedback type="invalid">{formErrors.title}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group controlId="proj-summary">
                <Form.Label className="fw-semibold">Summary</Form.Label>
                <Form.Control
                  as="textarea" rows={3}
                  value={form.summary ?? ''}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="Brief description"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="proj-status">
                <Form.Label className="fw-semibold">Status *</Form.Label>
                <Form.Select
                  value={form.status ?? 'PLANNING'}
                  onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
                  isInvalid={!!formErrors.status}
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{formErrors.status}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="proj-pi">
                <Form.Label className="fw-semibold">PI User ID *</Form.Label>
                <Form.Control
                  value={form.piId ?? ''}
                  onChange={(e) => setForm({ ...form, piId: e.target.value })}
                  isInvalid={!!formErrors.piId}
                  placeholder="Principal Investigator's user ID"
                />
                <Form.Control.Feedback type="invalid">{formErrors.piId}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="proj-start">
                <Form.Label className="fw-semibold">Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={form.startDate ?? ''}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="proj-end">
                <Form.Label className="fw-semibold">End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={form.endDate ?? ''}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group controlId="proj-tags">
                <Form.Label className="fw-semibold">Tags</Form.Label>
                <Form.Control
                  value={form.tags ?? ''}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="machine-learning, biology, health (comma separated)"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving} id="save-project-btn">
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : 'Save Project'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
