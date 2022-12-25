import * as React from "react";
import * as ReactDOM from "react-dom/client";

import Main from "components/Main";

import "index.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
    <React.StrictMode>
        <Main />
    </React.StrictMode>
);
