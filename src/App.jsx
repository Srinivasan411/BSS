import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const AdminPage = lazy(() => import("./pages/AdminPage"));
const HomePage = lazy(() => import("./pages/HomePage"));

function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[color:var(--brand-dark)] text-white">Loading...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
