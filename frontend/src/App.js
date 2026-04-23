import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { LocaleProvider } from "@/context/LocaleContext";
import { ShopifyProvider } from "@/context/ShopifyContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import HomePage from "@/pages/HomePage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";

function App() {
  return (
    <div className="App bg-[#050505] text-white">
      <LocaleProvider>
        <ShopifyProvider>
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/regulamin" element={<TermsPage />} />
              <Route path="/polityka-prywatnosci" element={<PrivacyPage />} />
            </Routes>
            <Footer />
            <CartDrawer />
            <Toaster
              theme="dark"
              position="top-center"
              toastOptions={{
                style: {
                  background: "#0a0a10",
                  color: "#fff",
                  border: "1px solid rgba(255,0,127,0.4)",
                  borderRadius: 0,
                  fontFamily: "Outfit, sans-serif",
                  boxShadow: "0 0 20px rgba(255,0,127,.25)",
                },
              }}
            />
          </BrowserRouter>
        </ShopifyProvider>
      </LocaleProvider>
    </div>
  );
}

export default App;
