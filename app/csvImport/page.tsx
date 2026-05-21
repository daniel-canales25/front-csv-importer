"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import Papa from "papaparse";
import { CommerceApiService } from "@/src/csv-import/infrastructure/api/CommerceApiService";
import { CommerceRowValidatorImpl } from "@/src/csv-import/infrastructure/validators/CommerceRowValidatorImpl";
import { validateCommerceAction, getQuarantineAction } from "@/src/csv-import/interfaces/http/actions/commerceActions";
import type { CommerceRow, RowValidationError } from "@/src/csv-import/application/validators/CommerceRowValidator";
import type { QuarantineRowDto } from "@/src/csv-import/application/dto/CommerceDto";

type TabType = "upload" | "process" | "errors";

type ProcessedDate = {
  date: string;
  insertedInQuarantine: number;
};

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
  const [processingDate, setProcessingDate] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [processedDates, setProcessedDates] = useState<ProcessedDate[]>([]);
  const [quarantineRows, setQuarantineRows] = useState<QuarantineRowDto[]>([]);
  const [loadingQuarantine, setLoadingQuarantine] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uniqueDates = useMemo(() => {
    const dates = new Set(rows.map((r) => r.pc_processdate));
    return Array.from(dates).sort();
  }, [rows]);

  const processedDateSet = useMemo(() => {
    return new Set(processedDates.map((p) => p.date));
  }, [processedDates]);

  const pendingDates = useMemo(() => {
    return uniqueDates.filter((d) => !processedDateSet.has(d));
  }, [uniqueDates, processedDateSet]);

  const allProcessed = uploaded && pendingDates.length === 0 && uniqueDates.length > 0;

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
    setProcessedDates([]);
    setProcessingDate(null);
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
      setActiveTab("process");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleValidateDate(date: string) {
    setValidating(true);
    setError(null);
    setProcessingDate(date);
    try {
      const result = await validateCommerceAction({ pcProcessdate: date });
      if (!result.success) {
        setError(result.error.message);
        return;
      }

      const newProcessed: ProcessedDate = {
        date,
        insertedInQuarantine: result.data.insertedInQuarantine,
      };
      setProcessedDates((prev) => [...prev, newProcessed]);
      setProcessingDate(null);
      if (newProcessed.insertedInQuarantine > 0) {
        loadQuarantine();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation failed");
      setProcessingDate(null);
    } finally {
      setValidating(false);
    }
  }

  async function handleValidateAll() {
    setValidating(true);
    setError(null);
    const acc: ProcessedDate[] = [];
    for (const date of pendingDates) {
      try {
        const result = await validateCommerceAction({ pcProcessdate: date });
        if (!result.success) {
          setError(`Error en fecha ${date}: ${result.error.message}`);
          return;
        }
        acc.push({ date, insertedInQuarantine: result.data.insertedInQuarantine });
      } catch (err) {
        setError(`Error en fecha ${date}: ${err instanceof Error ? err.message : "Unknown"}`);
        return;
      }
    }
    setProcessedDates((prev) => [...prev, ...acc]);
    setValidating(false);
    const anyQuarantine = acc.some((p) => p.insertedInQuarantine > 0);
    setActiveTab("errors");
    loadQuarantine();
  }

  async function goToErrors() {
    setActiveTab("errors");
    const anyQuarantine = processedDates.some((p) => p.insertedInQuarantine > 0);
    loadQuarantine();
  }

  async function loadQuarantine() {
    setLoadingQuarantine(true);
    try {
      const result = await getQuarantineAction();
      if (result.success) {
        setQuarantineRows(result.data);
      }
    } catch {
      setQuarantineRows([]);
    } finally {
      setLoadingQuarantine(false);
    }
  }

  useEffect(() => {
    if (activeTab === "errors") {
      loadQuarantine();
    }
  }, [activeTab]);

  function handleReset() {
    setFile(null);
    setHeaders([]);
    setRows([]);
    setRowErrors([]);
    setUploaded(false);
    setProcessedDates([]);
    setProcessingDate(null);
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
                      {rows.length} filas · {uniqueDates.length} fecha(s) única(s) · {rowErrors.length} error(es)
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

              {!uploaded && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                  Primero debes cargar y enviar un archivo CSV en la pestaña &quot;Cargar CSV&quot;.
                </div>
              )}

              {uploaded && uniqueDates.length === 0 && (
                <p className="text-gray-500">No se encontraron fechas de proceso en el archivo cargado.</p>
              )}

              {uploaded && uniqueDates.length > 0 && (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    Se encontraron {uniqueDates.length} fecha(s) de proceso en el archivo.
                    Selecciona las fechas que deseas validar. Los registros que no cumplan las reglas serán movidos a cuarentena.
                  </p>

                  <div className="space-y-2 mb-6">
                    {uniqueDates.map((date) => {
                      const isProcessed = processedDateSet.has(date);
                      const isProcessing = processingDate === date && validating;
                      const processed = processedDates.find((p) => p.date === date);

                      return (
                        <div
                          key={date}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                            isProcessed
                              ? "bg-green-50 border-green-200"
                              : isProcessing
                                ? "bg-blue-50 border-blue-200"
                                : "bg-white border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                isProcessed
                                  ? "bg-green-500 text-white"
                                  : isProcessing
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {isProcessed ? "✓" : isProcessing ? "..." : uniqueDates.indexOf(date) + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{date}</p>
                              {isProcessed && processed && (
                                <p className="text-xs text-green-600">
                                  {processed.insertedInQuarantine > 0
                                    ? `${processed.insertedInQuarantine} registro(s) en cuarentena`
                                    : "Todos válidos"}
                                </p>
                              )}
                              {isProcessing && (
                                <p className="text-xs text-blue-600">Procesando...</p>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleValidateDate(date)}
                            disabled={isProcessed || validating}
                            className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                              isProcessed
                                ? "bg-gray-100 text-gray-400 cursor-default"
                                : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                            }`}
                          >
                            {isProcessed ? "Procesado" : "Procesar"}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {pendingDates.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-yellow-800">
                        Faltan procesar {pendingDates.length} fecha(s).
                      </p>
                    </div>
                  )}

                  {allProcessed && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between">
                      <p className="text-sm text-green-800 font-medium">
                        ✓ Todas las fechas han sido procesadas
                      </p>
                      <button
                        onClick={goToErrors}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Ver resultados
                      </button>
                    </div>
                  )}

                  {!allProcessed && pendingDates.length > 1 && (
                    <button
                      onClick={handleValidateAll}
                      disabled={validating}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      {validating ? "Procesando todas..." : "Procesar todas las fechas restantes"}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Tab: Errors / Quarantine */}
          {activeTab === "errors" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Registros en cuarentena</h2>

              {processedDates.length > 0 && (
                <div className="mb-4 space-y-1">
                  {processedDates.map((p) => (
                    <div key={p.date} className="text-sm text-gray-600">
                      <strong>{p.date}</strong>: {p.insertedInQuarantine > 0
                        ? `${p.insertedInQuarantine} registro(s) en cuarentena`
                        : "Todos válidos"}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  {quarantineRows.length > 0 && `${quarantineRows.length} registro(s) en cuarentena`}
                </p>
                <button
                  onClick={() => loadQuarantine()}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Recargar
                </button>
              </div>

              {loadingQuarantine && <p className="text-gray-500">Cargando registros de cuarentena...</p>}

              {!loadingQuarantine && quarantineRows.length > 0 && (
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
                          <td className="border px-3 py-2 text-gray-600">{row.pcNomcomred ?? ""}</td>
                          <td className="border px-3 py-2 text-gray-600">{row.pcNumdoc}</td>
                          <td className="border px-3 py-2 text-gray-600">{row.pcProcessdate}</td>
                          <td className="border px-3 py-2 text-red-600">{row.motivo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loadingQuarantine && quarantineRows.length === 0 && allProcessed && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <p className="text-green-700 font-medium">✓ Todos los registros son válidos</p>
                  <p className="text-sm text-green-600 mt-1">No hay registros en cuarentena.</p>
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
