import React, { createContext, useContext, useState } from "react";
import { FloatNotification } from "../float-notification";

const NotificationsContext = createContext();

export function useNotifications() {
  return useContext(NotificationsContext);
}

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(null);

  const showNotifications = (type, message, onClose) => {
    setNotifications({ type, message, onClose });
  };

  const hideNotifications = () => {
    setNotifications(null);
  };

  return (
    <NotificationsContext.Provider
      value={{ showNotifications, hideNotifications }}
    >
      {children}
      {notifications && (
        <FloatNotification
          type={notifications.type}
          message={notifications.message}
          onClose={() => {
            hideNotifications();
            if (notifications.onClose) {
              notifications.onClose();
            }
          }}
        />
      )}
    </NotificationsContext.Provider>
  );
}
