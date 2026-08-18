import React from 'react';
import type { PermitStatus } from '../types';
import { Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: PermitStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'APPROVED':
      return (
        <span className="badge badge-approved">
          <CheckCircle2 size={14} /> Approved
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span className="badge badge-under_review">
          <Clock size={14} /> Under Review
        </span>
      );
    case 'REJECTED':
      return (
        <span className="badge badge-rejected">
          <XCircle size={14} /> Rejected
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span className="badge badge-pending">
          <AlertCircle size={14} /> Pending Verification
        </span>
      );
  }
};
