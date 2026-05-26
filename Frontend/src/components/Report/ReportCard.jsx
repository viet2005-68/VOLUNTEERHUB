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
              className={`flex flex-1 cursor-pointer flex-row justify-center gap-2 rounded-[10px] bg-deep-forest px-4 py-3 font-bold text-pale-canvas transition-all hover:brightness-110 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50`}
              onClick={onExportCsv}
              disabled={isExporting}
            >
              <div className="flex flex-row gap-2 items-center">
                <FileText className="w-4 h-4" />
                <span>{isExporting ? "Exporting..." : "Export as CSV"}</span>
              </div>
            </button>
            <button
              className={`flex flex-1 cursor-pointer flex-row justify-center gap-2 rounded-[10px] border-2 border-deep-forest px-4 py-3 font-bold text-deep-forest transition-all hover:-translate-y-0.5 hover:bg-deep-forest hover:text-pale-canvas disabled:cursor-not-allowed disabled:opacity-50`}
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
