import React from 'react';
import { Alert } from 'react-bootstrap';

interface AlertMessageProps {
  variant?: 'success' | 'danger' | 'warning' | 'info';
  message: string | null;
  onClose?: () => void;
}

const AlertMessage: React.FC<AlertMessageProps> = ({
  variant = 'danger',
  message,
  onClose,
}) => {
  if (!message) return null;
  return (
    <Alert variant={variant} dismissible={!!onClose} onClose={onClose} className="mb-3">
      {message}
    </Alert>
  );
};

export default AlertMessage;
