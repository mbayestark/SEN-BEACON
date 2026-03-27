import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import TrapMap from "./scenes/map";
import Activity from "./scenes/activity";
import Temperature from "./scenes/temperature";
import Timeline from "./scenes/timeline";

function App() {
  const [theme, colorMode] = useMode();
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <div className="app">
            <Sidebar />
            <main className="content">
              <Topbar />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/map" element={<TrapMap />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/temperature" element={<Temperature />} />
                <Route path="/timeline" element = {<Timeline/>} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;