import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// Corrected import: Import the service object from the correct file path
import { activityService } from '@/services/activityService';

interface ScheduleActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId?: string;
  opportunityId?: string;
  onActivityScheduled: () => void; // Callback to refresh the list
}

export const ScheduleActivityModal: React.FC<ScheduleActivityModalProps> = ({
  isOpen,
  onClose,
  leadId,
  opportunityId,
  onActivityScheduled,
}) => {
  const [activityType, setActivityType] = useState<'Call' | 'Email' | 'Meeting' | ''>('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
      setActivityType('');
      setScheduledAt('');
      setNotes('');
      setError(null);
  }

  const handleClose = () => {
      resetForm();
      onClose();
  }

  const handleSave = async () => {
    if (!activityType || !scheduledAt) {
      setError('Please select an activity type and a date.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      // Corrected function call: Use the method from the imported service object
      await activityService.scheduleActivity({
        type: activityType,
        scheduled_at: new Date(scheduledAt).toISOString(),
        notes,
        lead_id: leadId,
        opportunity_id: opportunityId,
      });
      onActivityScheduled(); // Trigger refresh
      handleClose();
    } catch (err) {
      setError('Failed to schedule activity. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Activity</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="activity-type" className="text-right">
              Type
            </Label>
            <Select onValueChange={(value) => setActivityType(value as any)} value={activityType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an activity type" />
              </SelectTrigger>
              <SelectContent id="activity-type">
                <SelectItem value="Call">Call</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date-time" className="text-right">
              Date & Time
            </Label>
            <Input
              id="date-time"
              type="datetime-local"
              className="col-span-3"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="notes"
              className="col-span-3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add some notes (optional)"
            />
          </div>
          {error && <p className="col-span-4 text-red-500 text-sm text-center">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
