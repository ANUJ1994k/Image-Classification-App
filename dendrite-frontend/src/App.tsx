// App.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import  useKeycloak  from '../src/keycloak';
import { v4 as uuidv4 } from 'uuid';
import Whiteboard from './components/Whiteboard';
import ImageUpload from './components/ImageUpload';

const App = () => {
  const navigate = useNavigate();
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) return <div>Loading...</div>;

  const handleCreateSession = () => {
    const sessionId = uuidv4();
    navigate(`/whiteboard/${sessionId}`);
  };

  return (
    <div>
      <ImageUpload/>
      {!keycloak.authenticated ? (
        <button onClick={() => keycloak.login()} className="bg-blue-600 text-white p-2 rounded">
          Login to Whiteboard
        </button>
      ) : (
        <div>
          <div className="flex justify-between p-4">
            <h1 className="text-xl font-semibold">
              Welcome {keycloak.tokenParsed?.preferred_username}
            </h1>
            <button
              onClick={() => keycloak.logout()}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
          <Whiteboard />
        </div>
      )}
    </div>
  );
};

export default App;
