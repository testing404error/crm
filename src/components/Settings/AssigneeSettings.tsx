import React, { useState, useEffect } from 'react';
import { Assignee } from '../../types';
import { getAssignees, addAssignee, updateAssignee, deleteAssignee } from '../../services/assigneeService';
import { Plus, Edit, Trash } from 'lucide-react';

export const AssigneeSettings: React.FC = () => {
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAssignee, setEditingAssignee] = useState<Assignee | null>(null);
  const [newAssigneeName, setNewAssigneeName] = useState('');
  const [newAssigneeEmail, setNewAssigneeEmail] = useState('');

  useEffect(() => {
    fetchAssignees();
  }, []);

  const fetchAssignees = async () => {
    try {
      setIsLoading(true);
      const data = await getAssignees();
      setAssignees(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch assignees');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAssignee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssigneeName || !newAssigneeEmail) return;

    try {
      await addAssignee({ name: newAssigneeName, email: newAssigneeEmail });
      setNewAssigneeName('');
      setNewAssigneeEmail('');
      fetchAssignees();
    } catch (err) {
      setError('Failed to add assignee');
    }
  };

  const handleUpdateAssignee = async (id: string, updates: Partial<Assignee>) => {
    try {
      await updateAssignee(id, updates);
      setEditingAssignee(null);
      fetchAssignees();
    } catch (err) {
      setError('Failed to update assignee');
    }
  };

  const handleDeleteAssignee = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this assignee?')) {
      try {
        await deleteAssignee(id);
        fetchAssignees();
      } catch (err) {
        setError('Failed to delete assignee');
      }
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium mb-4">Manage Assignees</h3>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleAddAssignee} className="mb-6 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Assignee Name"
          value={newAssigneeName}
          onChange={(e) => setNewAssigneeName(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="email"
          placeholder="Assignee Email"
          value={newAssigneeEmail}
          onChange={(e) => setNewAssigneeEmail(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add
        </button>
      </form>

      {isLoading ? (
        <p>Loading assignees...</p>
      ) : (
        <div className="space-y-2">
          {assignees.map((assignee) => (
            <div key={assignee.id} className="flex items-center justify-between p-2 border rounded-lg">
              {editingAssignee?.id === assignee.id ? (
                <div className="flex-1 flex space-x-2">
                  <input
                    type="text"
                    value={editingAssignee.name}
                    onChange={(e) => setEditingAssignee({ ...editingAssignee, name: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="email"
                    value={editingAssignee.email}
                    onChange={(e) => setEditingAssignee({ ...editingAssignee, email: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <p className="font-medium">{assignee.name}</p>
                  <p className="text-sm text-gray-500">{assignee.email}</p>
                </div>
              )}
              <div className="flex items-center space-x-2">
                {editingAssignee?.id === assignee.id ? (
                  <>
                    <button onClick={() => handleUpdateAssignee(assignee.id, { name: editingAssignee.name, email: editingAssignee.email })} className="text-green-600">Save</button>
                    <button onClick={() => setEditingAssignee(null)} className="text-gray-600">Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditingAssignee(assignee)} className="text-blue-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteAssignee(assignee.id)} className="text-red-600"><Trash className="w-4 h-4" /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
