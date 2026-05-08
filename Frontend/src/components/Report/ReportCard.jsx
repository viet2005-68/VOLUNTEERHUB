import React from "react";
import Card from "../Card.jsx/Card";
import { FileText, FileBraces } from "lucide-react";

function ReportCard({
  name,
  description,
  submit,
  icon,
  onExportCsv,
  onExportJson,
  color,
  dataIncludeL,
  isExporting,
}) {
  return (
    <div className="min-h-[300px]">
      <Card>
        <div className="flex flex-col p-4 gap-5 mx-auto">
          <div>
            <div className="flex flex-row items-center gap-1">
              <div className={`w-10 h-10 rounded-full ${color}`}>{icon}</div>
              <p className="text-lg font-bold">{name}</p>
            </div>
            <div className="text-sm text-gray-500">{description}</div>
          </div>

          <div className="p-8 bg-gray-100 text-sm rounded-2xl">
            {dataIncludeL.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </div>
          <div className="flex flex-row max-sm:gap-3 max-sm:flex-col flex-1 gap-10">
            <button
              className={`px-2 py-2 rounded-md p-4 bg-gray-900 text-white flex-1 cursor-pointer flex flex-row gap-2 justify-center hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={onExportCsv}
              disabled={isExporting}
            >
              <div className="flex flex-row gap-2 items-center">
                <FileText className="w-4 h-4" />
                <span>{isExporting ? "Exporting..." : "Export as CSV"}</span>
              </div>
            </button>
            <button
              className={`px-4 py-2 rounded-md text-black border border-gray-300 flex-1 cursor-pointer flex flex-row gap-2 justify-center hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={onExportJson}
              disabled={isExporting}
            >
              <div className="flex flex-row gap-2 items-center">
                <FileBraces className="w-4 h-4" />
                <span>{isExporting ? "Exporting..." : "Export as JSON"}</span>
              </div>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ReportCard;
