import React, { useState } from "react";
import { BarChart2, Download, Loader2 } from "lucide-react";
import EventPerformance from "../../components/AnalysisComponent/EventPerformance";
import VolunteerEngagement from "../../components/AnalysisComponent/VolunteerEngagement";
import ImpactMetrics from "../../components/AnalysisComponent/ImpactMetrics";
import VolunteerParticipationTrends from "../../components/AnalysisComponent/VolunteerParticipationTrends";
import AnalysisService from "../../services/analysisService";
import toast from "react-hot-toast";

function Analytics() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      const response = await AnalysisService.exportAllEventsCsv();
      const date = new Date().toISOString().split("T")[0];
      const blob = new Blob([response], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = "manager_events_report_" + date + ".csv";
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Report exported.");
    } catch (error) {
      console.error("Error exporting manager analytics report:", error);
      toast.error("Could not export report.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 rounded-[25px] border border-ash-whisper bg-pale-canvas/90 px-7 pb-7 pt-10 text-deep-forest sm:gap-8 sm:border-2 sm:px-8 sm:pb-8 sm:pt-12 md:px-10 md:pb-10 md:pt-14">
      {/* Header */}
      <div className="flex flex-col gap-4 pl-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 font-beni text-[56px] font-black uppercase leading-[0.75] text-deep-forest md:text-[80px]">
            <BarChart2 className="h-9 w-9 text-foudre-pink md:h-10 md:w-10" />
            Analytics & Reports
          </h1>
          <p className="mt-1 text-base font-medium leading-[1.2] text-deep-forest/70">
            Track performance and insights across your volunteer programs
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportReport}
          disabled={isExporting}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-deep-forest px-5 py-4 text-sm font-bold leading-[0.85] text-pale-canvas transition-colors hover:bg-foudre-pink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExporting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          {isExporting ? "Exporting..." : "Export Report"}
        </button>
      </div>

      {/* Top Row - 3 Cards */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <EventPerformance />
        <VolunteerEngagement />
        <ImpactMetrics />
      </div>

      {/* Bottom Row - Full Width Chart */}
      <VolunteerParticipationTrends />
    </div>
  );
}

export default Analytics;
