
import { Route, Routes } from 'react-router-dom'
import './App.css'
import { Toaster } from 'sonner'
import LandingPage from "@/pages/LandingPage";
import { MaterialCard } from './components/MaterialCard';
import MaterialsDashboard from './Pages/MaterialsDashboard';
// import OAuthSuccessPage from "@/pages/OAuthSuccessPage";
// import DashboardPage from "@/pages/DashBoardPage";
// import MaterialDetailPage from "@/pages/MaterialDetailsPage";

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/materials" element={<MaterialsDashboard/>} />
        
        {/* <Route path="/oauth-success" element={<OAuthSuccessPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/materials/:id" element={<MaterialDetailPage />} /> */}
      </Routes>
      <Toaster theme="dark" position="top-center" />
    </>
  )
}

export default App
