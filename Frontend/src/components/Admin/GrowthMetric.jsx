import React from "react";
import ModalActivity from "../ModalActivity/ModalActivity";

function GrowthMetric() {
  return (
    <div>
      <ModalActivity title="Growth Metric" subtile="Growth Metric">
        <div className="px-8 py-4 text-sm text-gray-500">
          Growth metrics will appear when analytics API data is available.
        </div>
      </ModalActivity>
    </div>
  );
}

export default GrowthMetric;
