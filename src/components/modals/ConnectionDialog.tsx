import React, { useState, useEffect } from "react";
import {
  X,
  Server,
  Database,
  Cloud,
  Check,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// --- Types & Interfaces ---
interface WizardState {
  source: {
    name: string;
    host: string;
    port: string;
    dbname: string;
    user: string;
    password: string;
    topicPrefix: string;
    includedSchema: string;
    replicationUser: string;
    replicationPassword: string;
    slotName: string;
    publicationName: string;
    snapshotMode: string;
  };
  selectedTables: string[];
  target: {
    uri: string;
    port: string;
    user: string;
    database: string;
  };
  cloud: {
    enabled: boolean;
    region: string;
    bucket: string;
  };
}

interface StepProps {
  data: WizardState;
  updateData: (stepKey: keyof WizardState, newData: any) => void;
}

// --- Mock Data ---
const MOCK_DETECTED_TABLES = [
  "public.customers",
  "public.products",
  "public.orders",
  "public.order_items",
  "public.payments",
  "public.inventory",
  "public.shipping_logs",
];

// --- Step 1: Source Configuration ---
const Step1Source: React.FC<StepProps> = ({ data, updateData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData("source", { ...data.source, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <h3 className="font-semibold text-slate-700 border-b pb-2">
        Step 1: Source Connection
      </h3>
      <p className="text-xs text-slate-500 mb-2">
        Start with the required PostgreSQL connection details. Advanced CDC
        options are pre-filled with safe defaults and can be adjusted in the
        next step.
      </p>

      <div className="grid grid-cols-[120px_1fr] gap-y-3 items-center text-xs">
        <label className="text-right pr-3 text-slate-600">Source Name:</label>
        <input
          name="name"
          value={data.source.name}
          onChange={handleChange}
          className="border border-slate-300 p-1.5 rounded focus:border-blue-500 outline-none bg-white"
          placeholder="e.g. ecommerse-postgres-source"
        />

        <label className="text-right pr-3 text-slate-600">Host / Server:</label>
        <input
          name="host"
          value={data.source.host}
          onChange={handleChange}
          className="border border-slate-300 p-1.5 rounded focus:border-blue-500 outline-none bg-white"
          placeholder="localhost or IP"
        />

        <label className="text-right pr-3 text-slate-600">Port:</label>
        <input
          name="port"
          type="number"
          value={data.source.port}
          onChange={handleChange}
          className="border border-slate-300 p-1.5 rounded focus:border-blue-500 outline-none bg-white"
          placeholder="5432"
        />

        <label className="text-right pr-3 text-slate-600">Database Name:</label>
        <input
          name="dbname"
          value={data.source.dbname}
          onChange={handleChange}
          className="border border-slate-300 p-1.5 rounded focus:border-blue-500 outline-none bg-white"
        />

        <label className="text-right pr-3 text-slate-600">Username:</label>
        <input
          name="user"
          value={data.source.user}
          onChange={handleChange}
          className="border border-slate-300 p-1.5 rounded focus:border-blue-500 outline-none bg-white"
        />

        <label className="text-right pr-3 text-slate-600">Password:</label>
        <input
          name="password"
          type="password"
          value={data.source.password}
          onChange={handleChange}
          className="border border-slate-300 p-1.5 rounded focus:border-blue-500 outline-none bg-white"
        />
      </div>
    </div>
  );
};

// --- Step 2: Table Selection ---
const Step2Tables: React.FC<StepProps> = ({ data, updateData }) => {
  // Auto-select all on initial load if empty
  useEffect(() => {
    if (data.selectedTables.length === 0) {
      updateData("selectedTables", MOCK_DETECTED_TABLES);
    }
  }, []);

  const toggleTable = (table: string) => {
    const newSelection = data.selectedTables.includes(table)
      ? data.selectedTables.filter((t) => t !== table)
      : [...data.selectedTables, table];
    updateData("selectedTables", newSelection);
  };

  const toggleAll = () => {
    if (data.selectedTables.length === MOCK_DETECTED_TABLES.length) {
      updateData("selectedTables", []); // Deselect all
    } else {
      updateData("selectedTables", MOCK_DETECTED_TABLES); // Select all
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300 h-full">
      <h3 className="font-semibold text-slate-700 border-b pb-2">
        Step 2: Table Selection
      </h3>
      <p className="text-xs text-slate-500">
        Select the tables you wish to replicate. All detected tables are
        selected by default.
      </p>

      <div className="border border-slate-300 rounded bg-white overflow-hidden flex flex-col flex-1 min-h-[220px]">
        <div className="bg-slate-50 p-2 border-b flex justify-between items-center text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={
                data.selectedTables.length === MOCK_DETECTED_TABLES.length
              }
              onChange={toggleAll}
              className="accent-blue-600"
            />
            Select All ({data.selectedTables.length}/
            {MOCK_DETECTED_TABLES.length})
          </label>
        </div>
        <div className="overflow-hidden p-2 flex-1">
          {MOCK_DETECTED_TABLES.map((table) => (
            <label
              key={table}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-50 cursor-pointer rounded text-xs text-slate-700"
            >
              <input
                type="checkbox"
                checked={data.selectedTables.includes(table)}
                onChange={() => toggleTable(table)}
                className="accent-blue-600"
              />
              <Database size={12} className="text-slate-400" />
              {table}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Step 3: Target Configuration ---
const Step3Target: React.FC<StepProps> = ({ data, updateData }) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    updateData("target", { ...data.target, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <h3 className="font-semibold text-slate-700 border-b pb-2">
        Step 3: Target Destination
      </h3>
      <p className="text-xs text-slate-500 mb-2">
        Configure your target database destination. These fields dynamically map
        to the chosen sink connector.
      </p>

      <div className="bg-blue-50/50 p-3 rounded border border-blue-100 mb-2">
        <div className="grid grid-cols-[120px_1fr] gap-y-3 items-center text-xs">
          <label className="text-right pr-3 text-slate-600 font-medium">
            Host URI:
          </label>
          <input
            name="uri"
            value={data.target.uri}
            onChange={handleChange}
            className="border border-slate-300 p-1.5 rounded focus:border-blue-500 outline-none bg-white"
            placeholder="mongodb+srv://..."
          />

          <label className="text-right pr-3 text-slate-600 font-medium">
            Port:
          </label>
          <input
            name="port"
            value={data.target.port}
            onChange={handleChange}
            className="border border-slate-300 p-1.5 rounded focus:border-blue-500 outline-none bg-white"
            placeholder="27017"
          />

          <label className="text-right pr-3 text-slate-600 font-medium">
            Username:
          </label>
          <input
            name="user"
            value={data.target.user}
            onChange={handleChange}
            className="border border-slate-300 p-1.5 rounded focus:border-blue-500 outline-none bg-white"
          />

          <label className="text-right pr-3 text-slate-600 font-medium">
            Target DB Name:
          </label>
          <input
            name="database"
            value={data.target.database}
            onChange={handleChange}
            className="border border-slate-300 p-1.5 rounded focus:border-blue-500 outline-none bg-white"
            placeholder="target_db"
          />
        </div>
      </div>
    </div>
  );
};

const Step4CaptureSettings: React.FC<StepProps> = ({ data, updateData }) => {
  const handleSourceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    updateData("source", { ...data.source, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <h3 className="font-semibold text-slate-700 border-b pb-2">
        Step 4: Capture Settings
      </h3>
      <p className="text-xs text-slate-500 mb-2">
        Required CDC fields with defaults from backend requirements. Adjust only
        if needed.
      </p>

      <div className="bg-slate-50/80 border border-slate-200 rounded p-3">
        <div className="grid grid-cols-[150px_1fr] gap-y-3 items-center text-xs">
          <label className="text-right pr-3 text-slate-600">
            Topic Prefix:
          </label>
          <input
            name="topicPrefix"
            value={data.source.topicPrefix}
            onChange={handleSourceChange}
            className="border border-slate-300 p-1.5 rounded focus:border-blue-500 outline-none bg-white"
          />

          <label className="text-right pr-3 text-slate-600">
            Included Schema:
          </label>
          <input
            name="includedSchema"
            value={data.source.includedSchema}
            onChange={handleSourceChange}
            className="border border-slate-300 p-1.5 rounded focus:border-blue-500 outline-none bg-white"
          />

          <label className="text-right pr-3 text-slate-600">
            Replication User:
          </label>
          <input
            name="replicationUser"
            value={data.source.replicationUser}
            onChange={handleSourceChange}
            className="border border-slate-300 p-1.5 rounded focus:border-blue-500 outline-none bg-white"
          />

          <label className="text-right pr-3 text-slate-600">
            Replication Password:
          </label>
          <input
            name="replicationPassword"
            type="password"
            value={data.source.replicationPassword}
            onChange={handleSourceChange}
            className="border border-slate-300 p-1.5 rounded focus:border-blue-500 outline-none bg-white"
          />

          <label className="text-right pr-3 text-slate-600">Slot Name:</label>
          <input
            name="slotName"
            value={data.source.slotName}
            onChange={handleSourceChange}
            className="border border-slate-300 p-1.5 rounded focus:border-blue-500 outline-none bg-white"
          />

          <label className="text-right pr-3 text-slate-600">
            Publication Name:
          </label>
          <input
            name="publicationName"
            value={data.source.publicationName}
            onChange={handleSourceChange}
            className="border border-slate-300 p-1.5 rounded focus:border-blue-500 outline-none bg-white"
          />

          <label className="text-right pr-3 text-slate-600">
            Snapshot Mode:
          </label>
          <select
            name="snapshotMode"
            value={data.source.snapshotMode}
            onChange={handleSourceChange}
            className="border border-slate-300 p-1.5 rounded focus:border-blue-500 outline-none bg-white"
          >
            <option value="initial">initial</option>
            <option value="always">always</option>
            <option value="never">never</option>
            <option value="initial_only">initial_only</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// --- Step 5: Cloud Replication ---
const Step5Cloud: React.FC<StepProps> = ({ data, updateData }) => {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <h3 className="font-semibold text-slate-700 border-b pb-2">
        Step 5: Cloud Replication
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Finalize your overarching replication environment.
      </p>

      <div
        className={`border rounded p-4 transition-colors ${data.cloud.enabled ? "border-orange-300 bg-orange-50/30" : "border-slate-300 bg-slate-50"}`}
      >
        <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 text-sm mb-4">
          <input
            type="checkbox"
            checked={data.cloud.enabled}
            onChange={(e) =>
              updateData("cloud", { ...data.cloud, enabled: e.target.checked })
            }
            className="accent-orange-500 w-4 h-4"
          />
          Enable AWS Cloud Replication
        </label>

        {data.cloud.enabled && (
          <div className="grid grid-cols-[100px_1fr] gap-y-3 items-center text-xs pl-6 animate-in slide-in-from-top-2">
            <label className="text-slate-600">AWS Region:</label>
            <select
              value={data.cloud.region}
              onChange={(e) =>
                updateData("cloud", { ...data.cloud, region: e.target.value })
              }
              className="border border-slate-300 p-1.5 rounded focus:border-orange-500 outline-none bg-white"
            >
              <option value="us-east-1">us-east-1 (N. Virginia)</option>
              <option value="eu-west-1">eu-west-1 (Ireland)</option>
              <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
            </select>

            <label className="text-slate-600">S3 Bucket:</label>
            <input
              value={data.cloud.bucket}
              onChange={(e) =>
                updateData("cloud", { ...data.cloud, bucket: e.target.value })
              }
              className="border border-slate-300 p-1.5 rounded focus:border-orange-500 outline-none bg-white"
              placeholder="my-datalake-bucket"
            />
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-slate-100 border border-slate-200 rounded text-xs text-slate-600">
        <h4 className="font-semibold mb-1 flex items-center gap-1">
          <Check size={14} className="text-green-600" /> Ready to Deploy
        </h4>
        <p>
          Review your settings. Clicking 'Finish' will initialize the{" "}
          {data.source.name || "source"} connector with{" "}
          {data.selectedTables.length} tables selected.
        </p>
      </div>
    </div>
  );
};

// --- Main Wizard Controller ---
export const MigrationWizard: React.FC<{
  onClose: () => void;
  onFinish: () => void;
}> = ({ onClose, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Centralized State
  const [wizardData, setWizardData] = useState<WizardState>({
    source: {
      name: "ecommerse-postgres-source",
      host: "postgres-db",
      port: "5432",
      dbname: "testDB",
      user: "myuser",
      password: "mypassword",
      topicPrefix: "ecom",
      includedSchema: "public",
      replicationUser: "debezium",
      replicationPassword: "Grasya123",
      slotName: "ecom_slot",
      publicationName: "grasya_pub",
      snapshotMode: "initial",
    },
    selectedTables: [],
    target: { uri: "", port: "", user: "", database: "" },
    cloud: { enabled: false, region: "us-east-1", bucket: "" },
  });

  const updateData = (stepKey: keyof WizardState, newData: any) => {
    setWizardData((prev) => ({ ...prev, [stepKey]: newData }));
  };

  const handleNext = () =>
    currentStep < totalSteps && setCurrentStep((prev) => prev + 1);
  const handleBack = () =>
    currentStep > 1 && setCurrentStep((prev) => prev - 1);

  const handleFinish = () => {
    console.log("Submitting Payload:", wizardData);
    // API Call goes here
    onFinish();
  };

  // Step Router
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Source data={wizardData} updateData={updateData} />;
      case 2:
        return <Step2Tables data={wizardData} updateData={updateData} />;
      case 3:
        return <Step3Target data={wizardData} updateData={updateData} />;
      case 4:
        return (
          <Step4CaptureSettings data={wizardData} updateData={updateData} />
        );
      case 5:
        return <Step5Cloud data={wizardData} updateData={updateData} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="w-[640px] h-[560px] bg-white rounded-lg shadow-2xl flex flex-col font-sans select-none overflow-hidden border border-slate-300">
        {/* Header */}
        <div className="h-12 bg-slate-50 flex items-center justify-between px-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Server size={18} className="text-blue-600" />
            <span className="font-semibold text-slate-800">
              Migration Setup Wizard
            </span>
          </div>
          <X
            size={18}
            className="cursor-pointer text-slate-400 hover:text-red-600 transition-colors"
            onClick={onClose}
          />
        </div>

        {/* Layout Body: Sidebar + Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Steps Indicator */}
          <div className="w-48 bg-slate-100 border-r border-slate-200 p-4 flex flex-col gap-1">
            {[
              "Source Config",
              "Table Selection",
              "Target DB",
              "Capture Settings",
              "Cloud Sync",
            ].map((label, idx) => {
              const stepNum = idx + 1;
              const isActive = currentStep === stepNum;
              const isPast = currentStep > stepNum;
              return (
                <div
                  key={label}
                  className={`flex items-center gap-2 p-2 rounded text-sm transition-colors ${isActive ? "bg-blue-100 text-blue-700 font-medium" : isPast ? "text-slate-600" : "text-slate-400"}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isActive ? "bg-blue-600 text-white" : isPast ? "bg-slate-300 text-slate-700" : "bg-slate-200"}`}
                  >
                    {isPast ? <Check size={12} /> : stepNum}
                  </div>
                  {label}
                </div>
              );
            })}
          </div>

          {/* Step Content Area */}
          <div className="flex-1 p-6 bg-white overflow-hidden">
            {renderStep()}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="h-14 bg-slate-50 border-t border-slate-200 flex items-center justify-between px-4">
          <button
            className="px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>

          <div className="flex gap-2">
            <button
              disabled={currentStep === 1}
              className="px-4 py-1.5 text-sm flex items-center gap-1 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              onClick={handleBack}
            >
              <ChevronLeft size={16} /> Back
            </button>

            {currentStep < totalSteps ? (
              <button
                className="px-4 py-1.5 text-sm flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700 rounded shadow-sm transition-colors"
                onClick={handleNext}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                className="px-6 py-1.5 text-sm flex items-center gap-1 bg-green-600 text-white hover:bg-green-700 rounded shadow-sm transition-colors"
                onClick={handleFinish}
              >
                <Check size={16} /> Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
