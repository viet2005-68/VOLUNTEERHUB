import { BrowserRouter as Router } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavbarProvider } from "./context/NavbarContext";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3200,
          style: {
            background: "#fff8f6",
            border: "2px solid #fce5df",
            borderRadius: "16px",
            boxShadow: "0 18px 45px rgba(0, 82, 45, 0.14)",
            color: "#00522d",
            fontFamily:
              '"Clash Grotesk", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 700,
          },
          success: {
            iconTheme: {
              primary: "#00522d",
              secondary: "#fff8f6",
            },
          },
          error: {
            iconTheme: {
              primary: "#db3c8a",
              secondary: "#fff8f6",
            },
          },
        }}
      />
      <QueryClientProvider client={queryClient}>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <NavbarProvider>
            <AppRouter />
          </NavbarProvider>
        </Router>
      </QueryClientProvider>
    </>
  );
}

export default App;
