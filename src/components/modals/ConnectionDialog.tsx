import React, { useState, useEffect } from "react";
import { Callout, Icon } from "@blueprintjs/core";
import iconMap from "../blueprint/utils/iconMap";
import BPDialog from "../blueprint/wrappers/BPDialog";
import BPInput from "../blueprint/wrappers/BPInput";
import BPSelect from "../blueprint/wrappers/BPSelect";
import BPButton from "../blueprint/wrappers/BPButton";
import BPPrimaryButton from "../blueprint/wrappers/BPPrimaryButton";

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
  atlas: {
    uri: string;
    database: string;
    collection: string;
    projectId?: string;
    authMethod: "basic" | "x509";
    username?: string;
    password?: string;
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

      <div className="grid grid-cols-[120px_1fr] gap-y-3 items-start text-xs">
        <label className="text-right pr-3 text-slate-600">Source Name:</label>
        <BPInput
          name="name"
          value={data.source.name}
          onChange={handleChange}
          placeholder="e.g. ecommerse-postgres-source"
        />

        <label className="text-right pr-3 text-slate-600">Host / Server:</label>
        <BPInput
          name="host"
          value={data.source.host}
          onChange={handleChange}
          placeholder="localhost or IP"
        />

        <label className="text-right pr-3 text-slate-600">Port:</label>
        <BPInput
          name="port"
          type="number"
          value={data.source.port}
          onChange={handleChange}
          placeholder="5432"
        />

        <label className="text-right pr-3 text-slate-600">Database Name:</label>
        <BPInput
          name="dbname"
          value={data.source.dbname}
          onChange={handleChange}
        />

        <label className="text-right pr-3 text-slate-600">Username:</label>
        <BPInput name="user" value={data.source.user} onChange={handleChange} />

        <label className="text-right pr-3 text-slate-600">Password:</label>
        <BPInput
          name="password"
          type="password"
          value={data.source.password}
          onChange={handleChange}
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
              <Icon
                icon={iconMap.Database}
                size={12}
                className="text-slate-400"
              />
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

      <div className="grid grid-cols-[120px_1fr] gap-y-3 items-center text-xs">
        <label className="text-right pr-3 text-slate-600 font-medium">
          Host URI:
        </label>
        <BPInput
          name="uri"
          value={data.target.uri}
          onChange={handleChange}
          placeholder="mongodb+srv://..."
        />

        <label className="text-right pr-3 text-slate-600 font-medium">
          Port:
        </label>
        <BPInput
          name="port"
          value={data.target.port}
          onChange={handleChange}
          placeholder="27017"
        />

        <label className="text-right pr-3 text-slate-600 font-medium">
          Username:
        </label>
        <BPInput name="user" value={data.target.user} onChange={handleChange} />

        <label className="text-right pr-3 text-slate-600 font-medium">
          Target DB Name:
        </label>
        <BPInput
          name="database"
          value={data.target.database}
          onChange={handleChange}
          placeholder="target_db"
        />
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

      <div className="grid grid-cols-[150px_1fr] gap-y-3 items-center text-xs">
        <label className="text-right pr-3 text-slate-600">Topic Prefix:</label>
        <BPInput
          name="topicPrefix"
          value={data.source.topicPrefix}
          onChange={handleSourceChange}
        />

        <label className="text-right pr-3 text-slate-600">
          Included Schema:
        </label>
        <BPInput
          name="includedSchema"
          value={data.source.includedSchema}
          onChange={handleSourceChange}
        />

        <label className="text-right pr-3 text-slate-600">
          Replication User:
        </label>
        <BPInput
          name="replicationUser"
          value={data.source.replicationUser}
          onChange={handleSourceChange}
        />

        <label className="text-right pr-3 text-slate-600">
          Replication Password:
        </label>
        <BPInput
          name="replicationPassword"
          type="password"
          value={data.source.replicationPassword}
          onChange={handleSourceChange}
        />

        <label className="text-right pr-3 text-slate-600">Slot Name:</label>
        <BPInput
          name="slotName"
          value={data.source.slotName}
          onChange={handleSourceChange}
        />

        <label className="text-right pr-3 text-slate-600">
          Publication Name:
        </label>
        <BPInput
          name="publicationName"
          value={data.source.publicationName}
          onChange={handleSourceChange}
        />

        <label className="text-right pr-3 text-slate-600">Snapshot Mode:</label>
        <BPSelect
          name="snapshotMode"
          value={data.source.snapshotMode}
          onChange={handleSourceChange}
        >
          <option value="initial">initial</option>
          <option value="always">always</option>
          <option value="never">never</option>
          <option value="initial_only">initial_only</option>
        </BPSelect>
      </div>
    </div>
  );
};

// --- Step 5: MongoDB Atlas Configuration ---
const isValidAtlasSrvUri = (uri: string) => uri.startsWith("mongodb+srv://");

const Step5Atlas: React.FC<StepProps> = ({ data, updateData }) => {
  const atlasUriValid = isValidAtlasSrvUri(data.atlas.uri);

  const handleAtlasChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    updateData("atlas", { ...data.atlas, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <h3 className="font-semibold text-slate-700 border-b pb-2">
        Step 5: MongoDB Atlas Configuration
      </h3>
      <p className="text-xs text-slate-500">
        Configure your MongoDB Atlas destination settings for the migration output.
      </p>

      <div className="space-y-3">
        <div className="grid grid-cols-[120px_1fr] gap-y-3 items-start text-xs">
          <label className="text-right pr-3 text-slate-600 pt-2">Connection URI:</label>
          <div className="space-y-1">
            <BPInput
              name="uri"
              placeholder="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/"
              value={data.atlas.uri}
              onChange={handleAtlasChange}
            />
            <p className="text-[11px] text-slate-500">
              Use your MongoDB Atlas cluster connection string (SRV format).
            </p>
            {!atlasUriValid && data.atlas.uri.trim().length > 0 && (
              <p className="text-[11px] text-red-600">
                Connection URI must start with "mongodb+srv://".
              </p>
            )}
          </div>

          <label className="text-right pr-3 text-slate-600">Database Name:</label>
          <BPInput
            name="database"
            placeholder="Database Name"
            value={data.atlas.database}
            onChange={handleAtlasChange}
          />

          <label className="text-right pr-3 text-slate-600">Collection Name:</label>
          <BPInput
            name="collection"
            placeholder="Collection Name"
            value={data.atlas.collection}
            onChange={handleAtlasChange}
          />

          <label className="text-right pr-3 text-slate-600">Project ID:</label>
          <BPInput
            name="projectId"
            placeholder="Atlas Project ID (optional)"
            value={data.atlas.projectId || ""}
            onChange={handleAtlasChange}
          />

          <label className="text-right pr-3 text-slate-600">Auth Method:</label>
          <BPSelect
            name="authMethod"
            value={data.atlas.authMethod}
            onChange={handleAtlasChange}
          >
            <option value="basic">Username / Password</option>
            <option value="x509">X.509 Certificate</option>
          </BPSelect>

          {data.atlas.authMethod === "basic" && (
            <>
              <label className="text-right pr-3 text-slate-600">Username:</label>
              <BPInput
                name="username"
                placeholder="Username"
                value={data.atlas.username || ""}
                onChange={handleAtlasChange}
              />

              <label className="text-right pr-3 text-slate-600">Password:</label>
              <BPInput
                name="password"
                type="password"
                placeholder="Password"
                value={data.atlas.password || ""}
                onChange={handleAtlasChange}
              />
            </>
          )}
        </div>

        <Callout intent="primary" className="text-xs mt-2">
          Ensure your current IP address is added in MongoDB Atlas Network Access.
        </Callout>
      </div>

      <div className="mt-2 p-3 bg-slate-100 border border-slate-200 rounded text-xs text-slate-600">
        <h4 className="font-semibold mb-1 flex items-center gap-1">
          <Icon icon={iconMap.Check} size={14} className="text-green-600" /> Ready to Deploy
        </h4>
        <p>
          Atlas destination is prepared. Clicking "Finish" will initialize the
          {" "}{data.source.name || "source"} connector with {data.selectedTables.length} tables selected.
        </p>
      </div>
    </div>
  );
};

// --- Main Wizard Controller ---
export const MigrationWizard: React.FC<{
  onClose: () => void;
  onFinish: (selectedTables: string[]) => void;
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
    atlas: {
      uri: "",
      database: "",
      collection: "",
      projectId: "",
      authMethod: "basic",
      username: "",
      password: "",
    },
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
    onFinish(wizardData.selectedTables);
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
        return <Step5Atlas data={wizardData} updateData={updateData} />;
      default:
        return null;
    }
  };

  return (
    <BPDialog isOpen onClose={onClose} className="migration-wizard-dialog">
      <div className="w-[820px] h-[720px] bg-white rounded-lg shadow-2xl flex flex-col font-sans select-none overflow-hidden border border-slate-300">
        {/* Header */}
        <div className="h-12 bg-slate-50 flex items-center justify-between px-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Icon icon={iconMap.Server} size={18} className="text-blue-600" />
            <span className="font-semibold text-slate-800">
              Migration Setup Wizard
            </span>
          </div>
          <Icon
            icon={iconMap.X}
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
              "Atlas Config",
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
                    {isPast ? <Icon icon={iconMap.Check} size={12} /> : stepNum}
                  </div>
                  {label}
                </div>
              );
            })}
          </div>

          {/* Step Content Area */}
          <div className="flex-1 p-8 bg-white overflow-hidden">
            {renderStep()}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="h-14 bg-slate-50 border-t border-slate-200 flex items-center justify-between px-4">
          <BPButton className="px-4 py-1.5 text-sm" onClick={onClose}>
            Cancel
          </BPButton>

          <div className="flex gap-2">
            <BPButton
              disabled={currentStep === 1}
              className="px-4 py-1.5 text-sm"
              onClick={handleBack}
              icon={iconMap.ChevronLeft}
            >
              Back
            </BPButton>

            {currentStep < totalSteps ? (
              <BPPrimaryButton
                onClick={handleNext}
                icon={iconMap.ChevronRight}
                label="Next"
              />
            ) : (
              <BPPrimaryButton
                onClick={handleFinish}
                icon={iconMap.Check}
                label="Finish"
              />
            )}
          </div>
        </div>
      </div>
    </BPDialog>
  );
};
