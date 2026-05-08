import { Calendar, User, Building, Download } from "lucide-react";
import React, { useState } from "react";
import ReportCard from "./ReportCard";
import AnalysisService from "../../services/analysisService";

function ReportAdmin() {
  const [exportingId, setExportingId] = useState(null);

  const handleExport = async (type, format) => {
    setExportingId(`${type}-${format}`);

    try {
      let response;
      let filename;
      let mimeType;

      if (type === "users") {
        if (format === "csv") {
          response = await AnalysisService.exportAllUsersCsv();
          filename = `users_export_${
            new Date().toISOString().split("T")[0]
          }.csv`;
          mimeType = "text/csv;charset=utf-8;";
        } else {
          response = await AnalysisService.exportAllUsersJson();
          filename = `users_export_${
            new Date().toISOString().split("T")[0]
          }.json`;
          mimeType = "application/json;charset=utf-8;";
          response = JSON.stringify(response, null, 2);
        }
      } else if (type === "events") {
        if (format === "csv") {
          response = await AnalysisService.exportAllEventsCsv();
          filename = `events_export_${
            new Date().toISOString().split("T")[0]
          }.csv`;
          mimeType = "text/csv;charset=utf-8;";
        } else {
          response = await AnalysisService.exportAllEventsJson();
          filename = `events_export_${
            new Date().toISOString().split("T")[0]
          }.json`;
          mimeType = "application/json;charset=utf-8;";
          response = JSON.stringify(response, null, 2);
        }
      } else if (type === "all") {
        // Export cả users và events
        if (format === "csv") {
          // Export 2 file CSV riêng biệt
          const [usersResponse, eventsResponse] = await Promise.all([
            AnalysisService.exportAllUsersCsv(),
            AnalysisService.exportAllEventsCsv(),
          ]);

          const dateStr = new Date().toISOString().split("T")[0];

          // Download users CSV
          const usersBlob = new Blob([usersResponse], {
            type: "text/csv;charset=utf-8;",
          });
          const usersLink = document.createElement("a");
          const usersUrl = URL.createObjectURL(usersBlob);
          usersLink.setAttribute("href", usersUrl);
          usersLink.setAttribute("download", `users_export_${dateStr}.csv`);
          usersLink.style.visibility = "hidden";
          document.body.appendChild(usersLink);
          usersLink.click();
          document.body.removeChild(usersLink);
          URL.revokeObjectURL(usersUrl);

          // Download events CSV
          const eventsBlob = new Blob([eventsResponse], {
            type: "text/csv;charset=utf-8;",
          });
          const eventsLink = document.createElement("a");
          const eventsUrl = URL.createObjectURL(eventsBlob);
          eventsLink.setAttribute("href", eventsUrl);
          eventsLink.setAttribute("download", `events_export_${dateStr}.csv`);
          eventsLink.style.visibility = "hidden";
          document.body.appendChild(eventsLink);
          eventsLink.click();
          document.body.removeChild(eventsLink);
          URL.revokeObjectURL(eventsUrl);

          setExportingId(null);
          return; // Thoát sớm vì đã xử lý xong
        } else {
          // Export 1 file JSON chứa cả users và events
          const [usersResponse, eventsResponse] = await Promise.all([
            AnalysisService.exportAllUsersJson(),
            AnalysisService.exportAllEventsJson(),
          ]);

          const combinedData = {
            exportDate: new Date().toISOString(),
            users: usersResponse,
            events: eventsResponse,
          };

          response = JSON.stringify(combinedData, null, 2);
          filename = `all_data_export_${
            new Date().toISOString().split("T")[0]
          }.json`;
          mimeType = "application/json;charset=utf-8;";
        }
      }

      // Create blob and download
      const blob = new Blob([response], { type: mimeType });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exporting ${type} as ${format}:`, error);
      alert(`Failed to export ${type}: ${error.message || "Unknown error"}`);
    } finally {
      setExportingId(null);
    }
  };

  const data = [
    {
      id: 1,
      exportType: "users",
      name: "Export Volunteer",
      description: "Report 1 description",
      submit:
        "Download complete volunteer data including profiles, activity, and statistics",
      icon: <User />,
      onExportCsv: () => handleExport("users", "csv"),
      onExportJson: () => handleExport("users", "json"),
      color: "text-blue-500",
      dataIncludeL: [
        "Users infomation (name, email, join data)",
        "Volunteer activity (hours, events, volunteers)",
        "Volunteer flags (hasWarning, isSuspended)",
        "Skills and exporience details",
        "Contact information and preferences",
      ],
    },
    {
      id: 2,
      exportType: "events",
      name: "Export Events",
      description: "Report 2 description",
      submit:
        "Download complete event data including details, status, and participation",
      icon: <Calendar />,
      onExportCsv: () => handleExport("events", "csv"),
      onExportJson: () => handleExport("events", "json"),
      color: "text-green-500",
      dataIncludeL: [
        "Event details (name, description, date, time, location)",
        "Event participants (name, email, join data)",
        "Event activity (hours, events, volunteers)",
        "Event status and approval information",
        "Organizer and manager details",
      ],
    },
    {
      id: 3,
      exportType: "organizations",
      name: "Export Organizations",
      description:
        "Download organization data including profiles and event activity",
      icon: <Building />,
      onExportCsv: () => console.log("Export Organizations CSV"),
      onExportJson: () => console.log("Export Organizations JSON"),
      color: "text-red-500",
      isOrganization: true,
      dataIncludeL: [
        "Organization profiles and details",
        "Associated events and activities",
        "Member information and roles",
        "Organization statistics",
        "Contact and location information",
      ],
    },
    {
      id: 4,
      exportType: "all",
      name: "Export All Data",
      description:
        "Download complete user data including profiles and activity",
      icon: <Download />,
      onExportCsv: () => handleExport("all", "csv"),
      onExportJson: () => handleExport("all", "json"),
      color: "text-yellow-500",
      isOrganization: true,
      dataIncludeL: [
        "Complete system data export",
        "All users, events, and organizations",
        "Comprehensive activity logs",
        "System-wide statistics",
        "Full database snapshot",
      ],
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 max-md:flex max-md:flex-col max-lg:justify-between">
        {data.map((item) => (
          <ReportCard
            key={item.id}
            {...item}
            isExporting={
              exportingId === `${item.exportType}-csv` ||
              exportingId === `${item.exportType}-json`
            }
          />
        ))}
      </div>
    </div>
  );
}

export default ReportAdmin;
