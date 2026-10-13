
import { Route, Routes } from 'react-router-dom'
import './App.css'

import LandingPage from "./Pages/LandingPage";
import MaterialsDashboard from './Pages/MaterialsDashboard';
 import OAuthSuccessPage from "./Pages/OAuthSuccessPage";
import { Toaster } from "sonner";
 import MaterialPage from "./Pages/MaterialPage";

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/materials" element={<MaterialsDashboard/>} />
        <Route path="/oauth-success" element={<OAuthSuccessPage />} />
       <Route path="/materials/:id" element={<MaterialPage />} />
        
      </Routes>
      <Toaster theme="dark" richColors position="top-right" />
    </>
  )
}

export default App
