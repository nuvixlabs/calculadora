import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth } from './utils/storage';
import Login from './components/Login';
import Layout from './components/Layout';
import CadastroTaxas from './components/CadastroTaxas';
import ConferenciaFrete from './components/ConferenciaFrete';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = getAuth();
  return auth.isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard/taxas" replace />} />
          <Route path="taxas" element={<CadastroTaxas />} />
          <Route path="conferencia" element={<ConferenciaFrete />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;



