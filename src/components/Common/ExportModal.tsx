import React, { useState } from 'react';
import { Download, X, FileText, CheckCircle } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  entityType: string;
  filename?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  data,
  entityType,
  filename
}) => {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [step, setStep] = useState<'configure' | 'complete'>('configure');

  const availableFields = data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'id') : [];

  React.useEffect(() => {
    if (availableFields.length > 0 && selectedFields.length === 0) {
      setSelectedFields(availableFields);
    }
  }, [availableFields]);

  // Move the conditional return after all hooks
  if (!isOpen || data.length === 0) return null;

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleSelectAll = () => {
    setSelectedFields(availableFields);
  };

  const handleSelectNone = () => {
    setSelectedFields([]);
  };

  const handleExport = () => {
    const exportData = data.map(item => {
      const filtered: any = {};
      selectedFields.forEach(field => {
        filtered[field] = item[field];
      });
      return filtered;
    });

    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFilename = `${entityType}_export_${timestamp}`;
    const finalFilename = filename || defaultFilename;

    if (format === 'csv') {
      const headers = selectedFields.join(',');
      const rows = exportData.map(item =>
        selectedFields.map(field => {
          const value = item[field];
          // Handle dates, arrays, and objects
          if (value instanceof Date) {
            return value.toISOString().split('T')[0];
          }
          if (Array.isArray(value)) {
            return `"${value.join('; ')}"`;
          }
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value)}"`;
          }
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      );
      
      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${finalFilename}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${finalFilename}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    }

    setStep('complete');
    setTimeout(() => {
      onClose();
      setStep('configure');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Export {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 'configure' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">
                    Exporting {data.length} records
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Export Format
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="csv"
                      checked={format === 'csv'}
                      onChange={(e) => setFormat(e.target.value as 'csv')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">CSV (Comma Separated)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="json"
                      checked={format === 'json'}
                      onChange={(e) => setFormat(e.target.value as 'json')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">JSON</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Fields to Export
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSelectAll}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Select All
                    </button>
                    <span className="text-xs text-gray-400">|</span>
                    <button
                      onClick={handleSelectNone}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Select None
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {availableFields.map((field) => (
                      <label key={field} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFields.includes(field)}
                          onChange={() => handleFieldToggle(field)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="mt-2 text-sm text-gray-600">
                  {selectedFields.length} of {availableFields.length} fields selected
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={selectedFields.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export {format.toUpperCase()}</span>
                </button>
                </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Export Successful!</h3>
              <p className="text-gray-600">
                Your file has been downloaded successfully
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};