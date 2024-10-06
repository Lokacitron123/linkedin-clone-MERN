import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { HomePage } from "./pages/HomePage";
import { SignUpPage } from "./pages/auth/SignUpPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/register' element={<SignUpPage />} />
          <Route path='/login' element={<LoginPage />} />
        </Routes>
        <Toaster />
      </Layout>
    </>
  );
}

export default App;
