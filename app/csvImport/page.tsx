"use client";

import React, { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import { CommerceApiService } from "@/src/csv-import/infrastructure/api/CommerceApiService";
import { CommerceRowValidatorImpl } from "@/src/csv-import/infrastructure/validators/CommerceRowValidatorImpl";
import { validateCommerceAction, getQuarantineAction } from "@/src/csv-import/interfaces/http/actions/commerceActions";
import type { CommerceRow, RowValidationError } from "@/src/csv-import/application/validators/CommerceRowValidator";
import type { QuarantineRowDto } from "@/src/csv-import/application/dto/CommerceDto";

type TabType = "upload" | "process" | "errors";

const api = new CommerceApiService();
const validator = new CommerceRowValidatorImpl();

export default function CsvImport() {
  const [activeTab, setActiveTab] = useState<TabType>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CommerceRow[]>([]);
  const [rowErrors, setRowErrors] = useState<RowValidationError[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [processDate, setProcessDate] = useState("");
  const [validating, setValidating] = useState(false);
  const [validateMessage, setValidateMessage] = useState<string | null>(null);
  const [quarantineRows, setQuarantineRows] = useState<QuarantineRowDto[]>([]);
  const [loadingQuarantine, setLoadingQuarantine] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = Papa.parse<CommerceRow>(content, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });

      setHeaders(result.meta.fields ?? []);
      setRows(result.data);

      const errors: RowValidationError[] = [];
      result.data.forEach((row, i) => {
        const rowErrors = validator.validate(row, i);
        errors.push(...rowErrors);
      });
      setRowErrors(errors);
    };
    reader.readAsText(file);
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setUploaded(false);
    setValidateMessage(null);
    setQuarantineRows([]);
    setError(null);
    if (selected) {
      parseFile(selected);
    } else {
      setHeaders([]);
      setRows([]);
      setRowErrors([]);
    }
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await api.uploadCsv(file);
      setUploaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleValidate() {
    if (!processDate) return;
    setValidating(true);
    setError(null);
    setValidateMessage(null);
    try {
      const result = await validateCommerceAction({ pcProcessdate: processDate });
      if (!result.success) {
        setError(result.error.message);
        return;
      }
      setValidateMessage(result.data.message);
      setActiveTab("errors");
      loadQuarantine(processDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation failed");
    } finally {
      setValidating(false);
    }
  }

  async function loadQuarantine(date: string) {
    setLoadingQuarantine(true);
    try {
      const result = await getQuarantineAction({ pcProcessdate: date });
      if (result.success) {
        setQuarantineRows(result.data);
      }
    } catch {
      setQuarantineRows([]);
    } finally {
      setLoadingQuarantine(false);
    }
  }

  function handleReset() {
    setFile(null);
    setHeaders([]);
    setRows([]);
    setRowErrors([]);
    setUploaded(false);
    setProcessDate("");
    setValidateMessage(null);
    setQuarantineRows([]);
    setError(null);
    setActiveTab("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const tabs = [
    { id: "upload" as TabType, label: "Cargar CSV", description: "Seleccionar y previsualizar archivo" },
    { id: "process" as TabType, label: "Procesar", description: "Validar registros por fecha" },
    { id: "errors" as TabType, label: "Errores", description: "Registros en cuarentena" },
  ];

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

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-8">
          {/* Tab: Upload + Preview */}
          {activeTab === "upload" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Cargar archivo CSV</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-file-input"
                />
                <label
                  htmlFor="csv-file-input"
                  className="cursor-pointer inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {file ? file.name : "Seleccionar archivo CSV"}
                </label>
              </div>

              {rows.length > 0 && (
                <>
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {rows.length} filas · {rowErrors.length} error(es) detectados
                    </p>
                    {!uploaded && (
                      <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
                      >
                        {uploading ? "Subiendo..." : "Enviar al servidor"}
                      </button>
                    )}
                    {uploaded && (
                      <span className="text-green-600 font-medium text-sm">✓ Enviado al servidor</span>
                    )}
                  </div>

                  {/* Validation errors */}
                  {rowErrors.length > 0 && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                        Errores de validación detectados en preview
                      </h3>
                      <ul className="space-y-1">
                        {rowErrors.map((err, i) => (
                          <li key={i} className="text-sm text-yellow-700">
                            Fila {err.row} — <strong>{err.field}</strong>: {err.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Table preview */}
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border px-3 py-2 text-left font-medium text-gray-700">#</th>
                          {headers.map((header) => (
                            <th key={header} className="border px-3 py-2 text-left font-medium text-gray-700">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, i) => {
                          const hasErrors = rowErrors.some((e) => e.row === i + 1);
                          return (
                            <tr key={i} className={`hover:bg-gray-50 ${hasErrors ? "bg-yellow-50" : ""}`}>
                              <td className="border px-3 py-2 text-gray-500 text-xs">{i + 1}</td>
                              {headers.map((header) => (
                                <td key={header} className="border px-3 py-2 text-gray-600">
                                  {row[header as keyof CommerceRow] ?? ""}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab: Process by date */}
          {activeTab === "process" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Procesar registros por fecha</h2>
              <p className="text-sm text-gray-500 mb-4">
                Selecciona la fecha de proceso (pc_processdate) para validar los registros cargados.
                Los registros que no cumplan las reglas serán movidos a cuarentena.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    pcProcessdate
                  </label>
                  <input
                    type="date"
                    value={processDate}
                    onChange={(e) => setProcessDate(e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
                  />
                </div>
                <button
                  onClick={handleValidate}
                  disabled={!processDate || validating}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {validating ? "Procesando..." : "Procesar registros"}
                </button>
                {validateMessage && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-3 text-sm text-green-700">
                    {validateMessage}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Errors / Quarantine */}
          {activeTab === "errors" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Registros en cuarentena</h2>

              {validateMessage && (
                <div className={`p-3 rounded-lg text-sm mb-4 ${
                  quarantineRows.length === 0
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                }`}>
                  {validateMessage}
                </div>
              )}

              {loadingQuarantine && <p className="text-gray-500">Cargando...</p>}

              {!loadingQuarantine && quarantineRows.length === 0 && (
                <p className="text-gray-500">No hay registros en cuarentena.</p>
              )}

              {quarantineRows.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border px-3 py-2 text-left font-medium text-gray-700">pc_nomcomred</th>
                        <th className="border px-3 py-2 text-left font-medium text-gray-700">pc_numdoc</th>
                        <th className="border px-3 py-2 text-left font-medium text-gray-700">pc_processdate</th>
                        <th className="border px-3 py-2 text-left font-medium text-gray-700">Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quarantineRows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="border px-3 py-2 text-gray-600">{row.pc_nomcomred}</td>
                          <td className="border px-3 py-2 text-gray-600">{row.pc_numdoc}</td>
                          <td className="border px-3 py-2 text-gray-600">{row.pc_processdate}</td>
                          <td className="border px-3 py-2 text-red-600">{row.motivo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                onClick={handleReset}
                className="mt-6 w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Nueva importación
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
