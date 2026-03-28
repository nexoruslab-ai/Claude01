import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => { if (onClose) onClose(); }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircleIcon className="w-5 h-5 text-silver-bright" />,
    error:   <XCircleIcon className="w-5 h-5 text-silver-dim" />,
    warning: <ExclamationTriangleIcon className="w-5 h-5 text-silver-dark" />,
    info:    <InformationCircleIcon className="w-5 h-5 text-silver" />
  };

  const borderColors = {
    success: 'rgba(232, 232, 232, 0.25)',
    error:   'rgba(128, 128, 128, 0.25)',
    warning: 'rgba(192, 192, 192, 0.25)',
    info:    'rgba(192, 192, 192, 0.2)'
  };

  return (
    <div className="toast" style={{ borderColor: borderColors[type] }}>
      <div className="flex items-center gap-3">
        {icons[type]}
        <p className="text-sm font-medium text-dark-text">{message}</p>
      </div>
    </div>
  );
};

export default Toast;
