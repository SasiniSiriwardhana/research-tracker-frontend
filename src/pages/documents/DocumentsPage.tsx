import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Modal, Form, Row, Col } from 'react-bootstrap';
import {
  getDocumentsByProject,
  createDocument,
  deleteDocument,
} from '../../services/documentService';
import { getProjectById } from '../../services/projectService';
import { DocumentDTO, ProjectDTO } from '../../interfaces';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import AlertMessage from '../../components/common/AlertMessage';

const EMPTY: Partial<DocumentDTO> = { title: '', description: '', urlOrPath: '' };

const DocumentsPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [project, setProject]       = useState<ProjectDTO | null>(null);
  const [documents, setDocuments]   = useState<DocumentDTO[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState<string | null>(null);

  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState<Partial<DocumentDTO>>(EMPTY);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving]         = useState(false);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [proj, docs] = await Promise.all([
        getProjectById(projectId),
        getDocumentsByProject(projectId),
      ]);
      setProject(proj);
      setDocuments(docs);
    } catch {
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const openUpload = () => {
    setForm(EMPTY);
    setFormErrors({});
    setShowModal(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title?.trim())    errs.title    = 'Document title is required.';
    if (!form.urlOrPath?.trim()) errs.urlOrPath = 'URL or file path is required.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpload = async () => {
    if (!validate() || !projectId) return;
    setSaving(true);
    try {
      await createDocument(projectId, form as DocumentDTO);
      setSuccess('Document uploaded successfully.');
      setShowModal(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Upload failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await deleteDocument(docId);
      setSuccess('Document deleted.');
      load();
    } catch {
      setError('Delete failed.');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <Button variant="link" className="p-0 me-2 text-muted" onClick={() => navigate(-1)}>← Back</Button>
          <h1 className="page-title d-inline">
            Documents — <span className="text-muted fs-5">{project?.title}</span>
          </h1>
        </div>
        {hasRole('ADMIN', 'PI', 'MEMBER') && (
          <Button variant="primary" onClick={openUpload} id="upload-document-btn">
            + Upload Document
          </Button>
        )}
      </div>

      <AlertMessage message={error}   variant="danger"  onClose={() => setError(null)} />
      <AlertMessage message={success} variant="success" onClose={() => setSuccess(null)} />

      {loading ? <Spinner /> : (
        <Card>
          <Card.Body className="p-0">
            {documents.length === 0 ? (
              <p className="text-center text-muted py-5">No documents yet. Upload the first one!</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Title</th><th>Description</th><th>URL / Path</th>
                      <th>Uploaded By</th><th>Uploaded At</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((d) => (
                      <tr key={d.id}>
                        <td className="fw-semibold">{d.title}</td>
                        <td className="text-muted">{d.description || '—'}</td>
                        <td>
                          <a
                            href={d.urlOrPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-truncate d-inline-block"
                            style={{ maxWidth: 220 }}
                          >
                            {d.urlOrPath}
                          </a>
                        </td>
                        <td>{d.uploadedByName || '—'}</td>
                        <td>{d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : '—'}</td>
                        <td>
                          {hasRole('ADMIN', 'PI') && (
                            <Button size="sm" variant="outline-danger" onClick={() => handleDelete(d.id!)}>
                              Delete
                            </Button>
                          )}
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

      {/* Upload Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group controlId="doc-title">
                <Form.Label className="fw-semibold">Document Title *</Form.Label>
                <Form.Control
                  value={form.title ?? ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  isInvalid={!!formErrors.title}
                  placeholder="e.g. Research Proposal v2"
                />
                <Form.Control.Feedback type="invalid">{formErrors.title}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="doc-url">
                <Form.Label className="fw-semibold">URL or File Path *</Form.Label>
                <Form.Control
                  value={form.urlOrPath ?? ''}
                  onChange={(e) => setForm({ ...form, urlOrPath: e.target.value })}
                  isInvalid={!!formErrors.urlOrPath}
                  placeholder="https://drive.google.com/... or /files/doc.pdf"
                />
                <Form.Control.Feedback type="invalid">{formErrors.urlOrPath}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="doc-desc">
                <Form.Label className="fw-semibold">Description</Form.Label>
                <Form.Control
                  as="textarea" rows={3}
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional notes or summary"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleUpload} disabled={saving} id="save-document-btn">
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Uploading…</> : 'Upload'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DocumentsPage;
