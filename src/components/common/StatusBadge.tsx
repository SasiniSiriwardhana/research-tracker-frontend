import React from 'react';
import { Badge } from 'react-bootstrap';
import { ProjectStatus } from '../../interfaces';

const STATUS_VARIANTS: Record<ProjectStatus, string> = {
  PLANNING: 'secondary',
  ACTIVE: 'success',
  ON_HOLD: 'warning',
  COMPLETED: 'primary',
  ARCHIVED: 'dark',
};

const StatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => (
  <Badge bg={STATUS_VARIANTS[status]} className="text-uppercase">
    {status.replace('_', ' ')}
  </Badge>
);

export default StatusBadge;
