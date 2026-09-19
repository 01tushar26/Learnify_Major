
import { Route, Routes } from 'react-router-dom'
import './App.css'

import LandingPage from "@/pages/LandingPage";
import { MaterialCard } from './components/MaterialCard';
import MaterialsDashboard from './Pages/MaterialsDashboard';
 import OAuthSuccessPage from "@/pages/OAuthSuccessPage";
import { toast, Toaster } from "sonner";

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/materials" element={<MaterialsDashboard/>} />
        <Route path="/oauth-success" element={<OAuthSuccessPage />} />
        
        {/* <Route path="/oauth-success" element={<OAuthSuccessPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/materials/:id" element={<MaterialDetailPage />} /> */}
        
      </Routes>
      <Toaster theme="dark" richColors position="top-right" />
    </>
  )
}

export default App
