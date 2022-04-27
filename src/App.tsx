import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "./App.css";
import Notes from "./components/Notes";

const customStyle = {};

function App() {
  return (
    <div style={customStyle}>
      <Authenticator>
        {({ signOut, user }) => (
          <div>
            <header>
              {user && user.username} <button onClick={signOut}>Sign out</button>
            </header>
            <Notes />
          </div>
        )}
      </Authenticator>
    </div>
  );
}

export default App;
