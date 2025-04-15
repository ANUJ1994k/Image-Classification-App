
// src/keycloak.ts
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: 'http://localhost:5000/auth',
  realm: "whiteboard-realm",
  clientId: "whiteboard-client"
});

export default keycloak;
