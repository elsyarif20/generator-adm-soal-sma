
import React, { useEffect, useState } from 'react';
import { NotificationType } from '../types';

interface NotificationProps {
  message: string;
  type: NotificationType;
}

const Notification: React.FC<NotificationProps> = ({ message, type }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2800); // Slightly less than App's timeout to allow for fade-out

    return () => clearTimeout(timer);
  }, [message, type]);

  const baseClasses = "fixed top-5 right-5 px-6 py-3 rounded-lg text-white z-50 shadow-lg transition-all duration-300";
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
  };

  const visibilityClasses = visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10';

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${visibilityClasses}`}>
      {message}
    </div>
  );
};

export default Notification;
