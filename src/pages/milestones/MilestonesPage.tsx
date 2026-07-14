import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Modal, Form, Badge, Row, Col } from 'react-bootstrap';
import {
  getMilestonesByProject,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from '../../services/milestoneService';
import { getProjectById } from '../../services/projectService';
import { MilestoneDTO, ProjectDTO } from '../../interfaces';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import AlertMessage from '../../components/common/AlertMessage';

const EMPTY: Partial<MilestoneDTO> = { title: '', description: '', dueDate: '', isCompleted: false };

const MilestonesPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [project, setProject]       = useState<ProjectDTO | null>(null);
  const [milestones, setMilestones] = useState<MilestoneDTO[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState<string | null>(null);

  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState<MilestoneDTO | null>(null);
  const [form, setForm]             = useState<Partial<MilestoneDTO>>(EMPTY);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving]         = useState(false);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [proj, miles] = await Promise.all([
        getProjectById(projectId),
        getMilestonesByProject(projectId),
      ]);
      setProject(proj);
      setMilestones(miles);
    } catch {
      setError('Failed to load milestones.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (m: MilestoneDTO) => {
    setEditTarget(m);
    setForm({ ...m });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title?.trim()) errs.title = 'Title is required.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !projectId) return;
    setSaving(true);
    try {
      if (editTarget) {
        await updateMilestone(editTarget.id!, form as MilestoneDTO);
        setSuccess('Milestone updated.');
      } else {
        await createMilestone(projectId, form as MilestoneDTO);
        setSuccess('Milestone created.');
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (milestoneId: string) => {
    if (!window.confirm('Delete this milestone?')) return;
    try {
      await deleteMilestone(milestoneId);
      setSuccess('Milestone deleted.');
      load();
    } catch {
      setError('Delete failed.');
    }
  };

  const completed = milestones.filter((m) => m.isCompleted).length;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <Button variant="link" className="p-0 me-2 text-muted" onClick={() => navigate(-1)}>← Back</Button>
          <h1 className="page-title d-inline">
            Milestones — <span className="text-muted fs-5">{project?.title}</span>
          </h1>
        </div>
        {hasRole('ADMIN', 'PI', 'MEMBER') && (
          <Button variant="primary" onClick={openCreate} id="add-milestone-btn">
            + Add Milestone
          </Button>
        )}
      </div>

      <AlertMessage message={error}   variant="danger"  onClose={() => setError(null)} />
      <AlertMessage message={success} variant="success" onClose={() => setSuccess(null)} />

      {/* Progress summary */}
      {!loading && milestones.length > 0 && (
        <Card className="mb-3">
          <Card.Body className="py-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold">Overall Progress</span>
              <span className="text-muted">{completed}/{milestones.length} completed</span>
            </div>
            <div className="progress" style={{ height: 12 }}>
              <div
                className="progress-bar bg-success"
                style={{ width: `${milestones.length ? (completed / milestones.length) * 100 : 0}%` }}
                role="progressbar"
              />
            </div>
          </Card.Body>
        </Card>
      )}

      {loading ? <Spinner /> : (
        <Card>
          <Card.Body className="p-0">
            {milestones.length === 0 ? (
              <p className="text-center text-muted py-5">No milestones yet. Click "+ Add Milestone" to get started.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Title</th><th>Description</th><th>Due Date</th>
                      <th>Status</th><th>Created By</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestones.map((m) => (
                      <tr key={m.id}>
                        <td className="fw-semibold">{m.title}</td>
                        <td className="text-muted">{m.description || '—'}</td>
                        <td>{m.dueDate || '—'}</td>
                        <td>
                          <Badge bg={m.isCompleted ? 'success' : 'secondary'}>
                            {m.isCompleted ? 'Completed' : 'Pending'}
                          </Badge>
                        </td>
                        <td>{m.createdByName || '—'}</td>
                        <td>
                          <div className="d-flex gap-1">
                            {hasRole('ADMIN', 'PI', 'MEMBER') && (
                              <Button size="sm" variant="outline-primary" onClick={() => openEdit(m)}>
                                Edit
                              </Button>
                            )}
                            {hasRole('ADMIN', 'PI') && (
                              <Button size="sm" variant="outline-danger" onClick={() => handleDelete(m.id!)}>
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

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editTarget ? 'Edit Milestone' : 'New Milestone'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group controlId="ms-title">
                <Form.Label className="fw-semibold">Title *</Form.Label>
                <Form.Control
                  value={form.title ?? ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  isInvalid={!!formErrors.title}
                  placeholder="Milestone title"
                />
                <Form.Control.Feedback type="invalid">{formErrors.title}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="ms-desc">
                <Form.Label className="fw-semibold">Description</Form.Label>
                <Form.Control
                  as="textarea" rows={3}
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Task details or notes"
                />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="ms-due">
                <Form.Label className="fw-semibold">Due Date</Form.Label>
                <Form.Control
                  type="date"
                  value={form.dueDate ?? ''}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Check
                type="checkbox"
                id="ms-completed"
                label="Mark as Completed"
                checked={!!form.isCompleted}
                onChange={(e) => setForm({ ...form, isCompleted: e.target.checked })}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving} id="save-milestone-btn">
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MilestonesPage;
