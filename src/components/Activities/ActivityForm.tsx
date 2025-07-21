import React, { useState, useEffect } from 'react';
import { Activity } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ActivityFormProps {
  activity?: Activity | null;
  onSubmit: (activityData: Partial<Activity>) => void;
  onCancel: () => void;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({ activity, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: 'task' as Activity['type'],
    title: '',
    description: '',
    dueDate: '', // YYYY-MM-DD
    dueTime: '', // HH:MM
    status: 'pending' as Activity['status'],
    relatedToType: '',
    relatedToId: '',
    relatedToName: '',
  });

  useEffect(() => {
    if (activity) {
      const dueDateISO = activity.dueDate ? new Date(activity.dueDate) : null;
      setFormData({
        type: activity.type,
        title: activity.title,
        description: activity.description || '',
        dueDate: dueDateISO ? dueDateISO.toISOString().split('T')[0] : '',
        dueTime: dueDateISO ? dueDateISO.toTimeString().slice(0, 5) : '',
        status: activity.status,
        relatedToType: activity.relatedTo?.type || '',
        relatedToId: activity.relatedTo?.id || '',
        relatedToName: activity.relatedTo?.name || '',
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData(prev => ({
        ...prev,
        type: 'task',
        title: '',
        description: '',
        dueDate: tomorrow.toISOString().split('T')[0],
        dueTime: '09:00',
        status: 'pending',
        relatedToType: '',
        relatedToId: '',
        relatedToName: '',
      }));
    }
  }, [activity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: 'type' | 'status' | 'relatedToType') => (value: string) => {
    const newState = { ...formData, [name]: value };
    if (name === 'relatedToType') {
        newState.relatedToId = '';
        newState.relatedToName = '';
    }
    setFormData(newState);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let fullDueDate: string | undefined;
    if (formData.dueDate) {
      const timePart = formData.dueTime || '00:00:00';
      fullDueDate = new Date(`${formData.dueDate}T${timePart}`).toISOString();
    }

    const activityData: Partial<Activity> = {
      type: formData.type,
      title: formData.title,
      description: formData.description || undefined,
      dueDate: fullDueDate,
      status: formData.status,
    };

    if (formData.relatedToType && formData.relatedToId && formData.relatedToName) {
      activityData.relatedTo = {
        type: formData.relatedToType,
        id: formData.relatedToId,
        name: formData.relatedToName,
      };
    } else {
      activityData.relatedTo = undefined;
    }

    onSubmit(activityData);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{activity ? 'Edit Activity' : 'Create New Activity'}</DialogTitle>
          <DialogDescription>
            Fill in the details for your task. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-6 pl-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="type">Activity Type *</Label>
                    <Select name="type" required value={formData.type} onValueChange={handleSelectChange('type')}>
                        <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="task">Task</SelectItem>
                            <SelectItem value="call">Call</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="meeting">Meeting</SelectItem>
                            <SelectItem value="note">Note</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" value={formData.status} onValueChange={handleSelectChange('status')}>
                        <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>

            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} />
                </div>
                <div>
                    <Label htmlFor="dueTime">Due Time</Label>
                    <Input id="dueTime" name="dueTime" type="time" value={formData.dueTime} onChange={handleChange} disabled={!formData.dueDate} />
                </div>
            </div>

            <div className="space-y-2 rounded-md border p-4">
                <Label>Related To (Optional)</Label>
                <Select name="relatedToType" value={formData.relatedToType} onValueChange={handleSelectChange('relatedToType')}>
                    <SelectTrigger><SelectValue placeholder="Select a type..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="opportunity">Opportunity</SelectItem>
                    </SelectContent>
                </Select>
                {formData.relatedToType && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <Input name="relatedToId" value={formData.relatedToId} onChange={handleChange} placeholder="Record ID" />
                        <Input name="relatedToName" value={formData.relatedToName} onChange={handleChange} placeholder="Record Name" />
                    </div>
                )}
            </div>
        </form>
        <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" onClick={handleSubmit}>{activity ? 'Update Activity' : 'Create Activity'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
