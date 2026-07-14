import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { getProjectById } from '../../services/projectService';
import { getMilestonesByProject } from '../../services/milestoneService';
import { getDocumentsByProject } from '../../services/documentService';
import { ProjectDTO, MilestoneDTO, DocumentDTO } from '../../interfaces';
import Spinner from '../../components/common/Spinner';
import AlertMessage from '../../components/common/AlertMessage';
import StatusBadge from '../../components/common/StatusBadge';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject]       = useState<ProjectDTO | null>(null);
  const [milestones, setMilestones] = useState<MilestoneDTO[]>([]);
  const [documents, setDocuments]   = useState<DocumentDTO[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [proj, miles, docs] = await Promise.all([
        getProjectById(id),
        getMilestonesByProject(id),
        getDocumentsByProject(id),
      ]);
      setProject(proj);
      setMilestones(miles);
      setDocuments(docs);
    } catch {
      setError('Failed to load project details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (!project) return <AlertMessage message={error} />;

  const completedMilestones = milestones.filter((m) => m.isCompleted).length;
  const progress = milestones.length > 0
    ? Math.round((completedMilestones / milestones.length) * 100)
    : 0;

  return (
    <div className="fade-in">
      {/* Back + Header */}
      <div className="page-header">
        <div>
          <Button variant="link" className="p-0 me-2 text-muted" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <h1 className="page-title d-inline">{project.title}</h1>
        </div>
        <div className="d-flex gap-2">
          <Link to={`/projects/${id}/milestones`} className="btn btn-outline-primary btn-sm">
            Milestones ({milestones.length})
          </Link>
          <Link to={`/projects/${id}/documents`} className="btn btn-outline-secondary btn-sm">
            Documents ({documents.length})
          </Link>
        </div>
      </div>

      <AlertMessage message={error} onClose={() => setError(null)} />

      <Row className="g-3">
        {/* Project Info */}
        <Col md={8}>
          <Card>
            <Card.Header>Project Details</Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col sm={6}>
                  <small className="text-muted fw-semibold d-block">STATUS</small>
                  <StatusBadge status={project.status} />
                </Col>
                <Col sm={6}>
                  <small className="text-muted fw-semibold d-block">PRINCIPAL INVESTIGATOR</small>
                  <span className="fw-semibold">{project.piName || project.piId}</span>
                </Col>
                <Col sm={6}>
                  <small className="text-muted fw-semibold d-block">START DATE</small>
                  <span>{project.startDate || '—'}</span>
                </Col>
                <Col sm={6}>
                  <small className="text-muted fw-semibold d-block">END DATE</small>
                  <span>{project.endDate || '—'}</span>
                </Col>
                {project.tags && (
                  <Col sm={12}>
                    <small className="text-muted fw-semibold d-block mb-1">TAGS</small>
                    {project.tags.split(',').map((t) => (
                      <Badge key={t} bg="light" text="dark" className="me-1">{t.trim()}</Badge>
                    ))}
                  </Col>
                )}
                {project.summary && (
                  <Col sm={12}>
                    <small className="text-muted fw-semibold d-block">SUMMARY</small>
                    <p className="mb-0">{project.summary}</p>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Progress */}
        <Col md={4}>
          <Card>
            <Card.Header>Milestone Progress</Card.Header>
            <Card.Body className="text-center">
              <div style={{ fontSize: '3rem', fontWeight: 700, color: '#0d6efd' }}>{progress}%</div>
              <div className="progress mt-2" style={{ height: 10 }}>
                <div
                  className="progress-bar"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                />
              </div>
              <small className="text-muted mt-2 d-block">
                {completedMilestones} / {milestones.length} completed
              </small>
              <Link to={`/projects/${id}/milestones`} className="btn btn-sm btn-primary mt-3 w-100">
                Manage Milestones
              </Link>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header>Documents</Card.Header>
            <Card.Body className="text-center">
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#20c997' }}>{documents.length}</div>
              <small className="text-muted">Uploaded documents</small>
              <Link to={`/projects/${id}/documents`} className="btn btn-sm btn-outline-secondary mt-3 w-100">
                View Documents
              </Link>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Milestones */}
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Recent Milestones</span>
              <Link to={`/projects/${id}/milestones`} className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              {milestones.length === 0 ? (
                <p className="text-muted text-center py-4">No milestones yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead><tr><th>Title</th><th>Due Date</th><th>Status</th><th>Created By</th></tr></thead>
                    <tbody>
                      {milestones.slice(0, 5).map((m) => (
                        <tr key={m.id}>
                          <td className="fw-semibold">{m.title}</td>
                          <td>{m.dueDate || '—'}</td>
                          <td>
                            <Badge bg={m.isCompleted ? 'success' : 'secondary'}>
                              {m.isCompleted ? 'Completed' : 'Pending'}
                            </Badge>
                          </td>
                          <td>{m.createdByName || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProjectDetailPage;
