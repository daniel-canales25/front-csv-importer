"use client";

import React, { useState, useRef } from "react";
import { uploadCsvAction, getAllImportsAction } from "@/src/csv-import/interfaces/http/actions/csvImportActions";
import type { CsvImportResponseDto } from "@/src/csv-import/application/dto/CsvDataDto";

type TabType = "upload" | "preview" | "errors";

export default function CsvImport() {
  const [activeTab, setActiveTab] = useState<TabType>("upload");
  const [importData, setImportData] = useState<CsvImportResponseDto | null>(null);
  const [allImports, setAllImports] = useState<CsvImportResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: "upload" as TabType, label: "Cargar CSV", description: "Seleccionar archivo commerce_DDMMYYYY.csv" },
    { id: "preview" as TabType, label: "Vista previa", description: "Datos parseados del CSV" },
    { id: "errors" as TabType, label: "Errores", description: "Registros en cuarentena" },
  ];

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const content = await file.text();
      const result = await uploadCsvAction({
        filename: file.name,
        content,
        uploadedBy: "user@example.com",
      });

      if (!result.success) {
        setError(typeof result.error === "string" ? result.error : "Validation error");
        return;
      }

      setImportData(result.data);
      setActiveTab(result.data.errorRows > 0 ? "errors" : "preview");
      refreshList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function refreshList() {
    const list = await getAllImportsAction();
    setAllImports(list);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            CSV Import - Gestión de Comercios
          </h1>
          <p className="text-gray-600 mt-1">
            Sistema de validación y carga masiva de datos
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                <div className="text-xs mt-1 text-gray-400">{tab.description}</div>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === "upload" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Cargar archivo CSV</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-file-input"
                />
                <label
                  htmlFor="csv-file-input"
                  className="cursor-pointer inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {loading ? "Procesando..." : "Seleccionar archivo CSV"}
                </label>
                {error && (
                  <p className="mt-4 text-red-600">{error}</p>
                )}
              </div>

              {allImports.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-2">Importaciones realizadas</h3>
                  <ul className="space-y-2">
                    {allImports.map((imp) => (
                      <li key={imp.id} className="border rounded p-3 text-sm">
                        <strong>{imp.filename}</strong> — {imp.status} —{" "}
                        {imp.validRows} válidas / {imp.errorRows} errores
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === "preview" && importData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Vista previa — {importData.filename}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {importData.validRows} filas válidas · {importData.errorRows} errores
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {importData.headers.map((header) => (
                        <th key={header} className="border px-3 py-2 text-left font-medium text-gray-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importData.data.slice(0, 10).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {importData.headers.map((header) => (
                          <td key={header} className="border px-3 py-2 text-gray-600">
                            {row[header] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {importData.data.length > 10 && (
                <p className="text-sm text-gray-400 mt-2">
                  Mostrando 10 de {importData.data.length} filas
                </p>
              )}
            </div>
          )}

          {activeTab === "errors" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Registros en cuarentena</h2>
              {importData && importData.errors.length > 0 ? (
                <ul className="space-y-2">
                  {importData.errors.map((err, i) => (
                    <li key={i} className="border-l-4 border-red-400 bg-red-50 p-3 text-sm text-red-700">
                      Fila {err.row}: {err.message}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No hay errores en la última importación.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
