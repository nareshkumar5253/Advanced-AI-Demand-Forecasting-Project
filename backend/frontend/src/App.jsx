import React, { useState } from "react";
import Layout from "./components/Layout";
import { useAuth } from "./contexts/AuthContext";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ForecastPage from "./pages/ForecastPage";
import ReportsPage from "./pages/ReportsPage";
import UploadPage from "./pages/UploadPage";

export default function App() {
  const { user } = useAuth();

  const [activePage, setActivePage] = useState("dashboard");

  const [datasets] = useState([
    {
      id: 1,
      name: "sales.csv"
    }
  ]);

  const [selectedDatasetId, setSelectedDatasetId] = useState("1");

  const analytics = {
    total_sales: 35000,
    forecast_accuracy: 94,
    uploaded_datasets: 1,
    forecast_points: 12
  };

  if (!user) return <AuthPage />;

  const commonProps = {
    datasets,
    selectedDatasetId,
    onDatasetChange: setSelectedDatasetId,
    analytics
  };

  return (
    <Layout activePage={activePage} onPageChange={setActivePage}>
      {activePage === "dashboard" && (
        <Dashboard {...commonProps} />
      )}

      {activePage === "upload" && (
        <UploadPage />
      )}

      {activePage === "forecast" && (
        <ForecastPage {...commonProps} />
      )}

      {activePage === "reports" && (
        <ReportsPage {...commonProps} />
      )}
    </Layout>
  );
}