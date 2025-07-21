import React, { useState } from 'react';
import { Lead } from '../../types';
import { X, Plus, Tag, Check } from 'lucide-react';

interface TagManagerProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onUpdateTags: (leadId: string, tags: string[]) => void;
  availableTags: string[];
}

export const TagManager: React.FC<TagManagerProps> = ({
  isOpen,
  onClose,
  lead,
  onUpdateTags,
  availableTags
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(lead.tags);
  const [newTag, setNewTag] = useState('');

  if (!isOpen) return null;

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddNewTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleSave = () => {
    onUpdateTags(lead.id, selectedTags);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNewTag();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Tag className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Manage Tags</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">{lead.name}</h3>
            <p className="text-sm text-gray-600">{lead.email}</p>
          </div>

          {/* Add New Tag */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add New Tag
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter tag name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddNewTag}
                disabled={!newTag.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Available Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Tags
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {availableTags.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No tags available</p>
              ) : (
                <div className="space-y-2">
                  {availableTags.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => handleToggleTag(tag)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{tag}</span>
                      {selectedTags.includes(tag) && (
                        <Check className="w-4 h-4 text-green-600 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Tags Preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected Tags ({selectedTags.length})
            </label>
            <div className="min-h-[60px] border border-gray-200 rounded-lg p-3">
              {selectedTags.length === 0 ? (
                <p className="text-sm text-gray-500">No tags selected</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        onClick={() => handleToggleTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Tags
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};