import React, { useState } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
  entityType: string;
  sampleData?: Record<string, any>;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  entityType,
  sampleData
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');
  const [errors, setErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    
    // Simulate CSV parsing
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          const row: any = { id: `import-${index}` };
          headers.forEach((header, i) => {
            row[header] = values[i] || '';
          });
          return row;
        });
      
      setImportData(data);
      setStep('preview');
      
      // Validate data
      const validationErrors: string[] = [];
      data.forEach((row, index) => {
        if (entityType === 'leads' && !row.email) {
          validationErrors.push(`Row ${index + 1}: Email is required`);
        }
        if (entityType === 'customers' && !row.name) {
          validationErrors.push(`Row ${index + 1}: Name is required`);
        }
      });
      setErrors(validationErrors);
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = () => {
    if (errors.length === 0) {
      onImport(importData);
      setStep('complete');
      setTimeout(() => {
        onClose();
        resetModal();
      }, 2000);
    }
  };

  const resetModal = () => {
    setFile(null);
    setImportData([]);
    setStep('upload');
    setErrors([]);
    setDragActive(false);
  };

  const downloadSample = () => {
    if (!sampleData) return;
    
    const headers = Object.keys(sampleData);
    const csvContent = [
      headers.join(','),
      headers.map(h => sampleData[h]).join(',')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}_sample.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Import {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
          </h2>
          <button
            onClick={() => { onClose(); resetModal(); }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                    dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your CSV file here, or click to browse
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Supports CSV files up to 10MB
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                  >
                    Choose File
                  </label>
                </div>
              </div>

              {sampleData && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Need a template?</h3>
                    <button
                      onClick={downloadSample}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Download Sample CSV</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Download our sample CSV file to see the expected format and required fields.
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Preview Import Data ({importData.length} records)
                </h3>
                {file && (
                  <div className="text-sm text-gray-600">
                    File: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <h4 className="font-medium text-red-800">Validation Errors</h4>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {importData.length > 0 && Object.keys(importData[0]).filter(k => k !== 'id').map((key) => (
                          <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {importData.slice(0, 10).map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {Object.keys(row).filter(k => k !== 'id').map((key) => (
                            <td key={key} className="px-4 py-3 text-sm text-gray-900">
                              {row[key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {importData.length > 10 && (
                  <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 text-center">
                    Showing first 10 of {importData.length} records
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={errors.length > 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import {importData.length} Records
                </button>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Import Successful!</h3>
              <p className="text-gray-600">
                Successfully imported {importData.length} {entityType}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};