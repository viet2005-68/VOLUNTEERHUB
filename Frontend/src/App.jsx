import { BrowserRouter as Router } from "react-router-dom";
import Sidebar from "./pages/DemoPages/Sidebar";
import AppRouter from "./routes/AppRouter";
import EventCard from "./components/Dashboard/EventCard";
import ShortCut from "./components/Dashboard/ShortCut";
import DashBoardOverview from "./components/Dashboard/DashBoardOverview";
import NavBar from "./components/Sidebar/NavBar";
import DashboardLayout from "./pages/DashBoard/DashboardLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Import apidump để kích hoạt mock API fetch interceptor
import { NavbarProvider } from "./context/NavbarContext";
import "./pages/EventPage/apidump";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <Toaster position="top-right" />
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
