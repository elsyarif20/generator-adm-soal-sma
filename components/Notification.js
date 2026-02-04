
import React, { useEffect, useState } from 'react';

const Notification = ({ message, type }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2800);

    return () => clearTimeout(timer);
  }, [message, type]);

  const baseClasses = "fixed top-5 right-5 px-6 py-3 rounded-lg text-white z-50 shadow-lg transition-all duration-300";
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
  };

  const visibilityClasses = visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10';

  return React.createElement("div", { className: `${baseClasses} ${typeClasses[type]} ${visibilityClasses}` }, message);
};

export default Notification;
