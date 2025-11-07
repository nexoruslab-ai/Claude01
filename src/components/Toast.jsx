import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircleIcon className="w-5 h-5 text-green-400" />,
    error: <XCircleIcon className="w-5 h-5 text-red-400" />,
    warning: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />,
    info: <InformationCircleIcon className="w-5 h-5 text-blue-400" />
  };

  const borderColors = {
    success: 'rgba(34, 197, 94, 0.3)',
    error: 'rgba(239, 68, 68, 0.3)',
    warning: 'rgba(234, 179, 8, 0.3)',
    info: 'rgba(59, 130, 246, 0.3)'
  };

  return (
    <div
      className="toast animate-fadeIn"
      style={{ borderColor: borderColors[type] }}
    >
      <div className="flex items-center gap-3">
        {icons[type]}
        <p className="text-sm font-medium text-dark-text dark:text-dark-text">
          {message}
        </p>
      </div>
    </div>
  );
};

export default Toast;
