// src/KeycloakProvider.tsx
import React, { useEffect, useState } from "react";
import keycloak from "./keycloak";
import { ReactKeycloakProvider } from "@react-keycloak/web";

const KeycloakInitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isKeycloakInitialized, setIsKeycloakInitialized] = useState(false);

  useEffect(() => {
    if (!keycloak.authenticated) {
      keycloak.init({ onLoad: "login-required", checkLoginIframe: false }).then((authenticated) => {
        if (authenticated) setIsKeycloakInitialized(true);
      });
    }
  }, []);

  if (!isKeycloakInitialized) return <div>Loading auth...</div>;

  return (
    <ReactKeycloakProvider authClient={keycloak}>
      {children}
    </ReactKeycloakProvider>
  );
};

export default KeycloakInitProvider;
