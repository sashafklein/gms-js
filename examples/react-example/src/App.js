import logo from "./logo.svg";
import "./App.css";
import "gimme-sats-js";

const GimmeSatsRoot = ({ settings }) => (
  <div
    id="gms-root"
    data-settings={JSON.stringify({ theme: "dark-blue", ...settings })}
  ></div>
);

const GimmeSatsButton = ({
  bolt = true,
  theme = "dark-blue",
  settings = {},
  children = "Gimme Sats",
}) => {
  const className = `gms-button gms-button--${theme} ${
    bolt ? "gms-button--bolt" : ""
  }`;
  return (
    <button className={className} data-settings={JSON.stringify(settings)}>
      {children}
    </button>
  );
};

function App() {
  return (
    <div>
      <GimmeSatsRoot settings={{ to: "sasha" }} />
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <GimmeSatsButton />
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    </div>
  );
}

export default App;
