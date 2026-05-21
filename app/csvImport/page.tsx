'use client';

import React, { useState } from 'react';

type TabType = 'upload' | 'process' | 'errors';

export default function CsvImport() {
  const [activeTab, setActiveTab] = useState<TabType>('upload');

  const tabs = [
    { id: 'upload' as TabType, label: '📁 Cargar CSV', description: 'Cargar archivo commerce_DDMMYYYY.csv' },
    { id: 'process' as TabType, label: '⚙️ Procesar', description: 'Procesar datos por fecha' },
    { id: 'errors' as TabType, label: '❌ Errores', description: 'Ver registros en cuarentena' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
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

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-all
                  ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-lg mr-2">{tab.label.split(' ')[0]}</span>
                <span className="hidden sm:inline">
                  {tab.label.split(' ').slice(1).join(' ')}
                </span>
                <div className="text-xs mt-1 text-gray-400">
                  {tab.description}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Panel */}
        <div className="mt-8">
          {activeTab === 'upload' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Cargar archivo CSV</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">
                  Aquí irá el componente de carga de archivos
                </p>
              </div>
            </div>
          )}

          {activeTab === 'process' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Procesar por fecha</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">
                  Aquí irá el componente de procesamiento por fecha
                </p>
              </div>
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Registros en cuarentena</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">
                  Aquí irá la lista de errores
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}