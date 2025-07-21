import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { activityService } from '@/services/activityService';
import { leadsService } from '@/services/leadsService';
import { opportunityService } from '@/services/opportunityService';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from "@/lib/utils";

interface UniversalScheduleActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityScheduled: () => void;
}

type ParentType = 'lead' | 'opportunity';
type SelectableItem = { id: string; name: string };

export const UniversalScheduleActivityModal: React.FC<UniversalScheduleActivityModalProps> = ({ isOpen, onClose, onActivityScheduled }) => {
  const { user } = useAuth();
  const [activityType, setActivityType] = useState<'Call' | 'Email' | 'Meeting' | ''>('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [parentType, setParentType] = useState<ParentType>('lead');
  const [parentItems, setParentItems] = useState<SelectableItem[]>([]);
  const [selectedParent, setSelectedParent] = useState<SelectableItem | null>(null);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !user) return;
    const fetchItems = async () => {
      setIsLoading(true);
      setSelectedParent(null);
      try {
        const items = parentType === 'lead'
          ? await leadsService.getAllLeadsForSelection(user.id)
          : await opportunityService.getAllOpportunitiesForSelection(user.id);
        setParentItems(items);
      } catch (err) {
        setError('Failed to load items. Please try again.');
        setParentItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [parentType, isOpen, user]);

  const handleSave = async () => {
    if (!activityType || !scheduledAt || !selectedParent) {
      setError('Please fill all required fields.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await activityService.scheduleActivity({
        type: activityType,
        scheduled_at: new Date(scheduledAt).toISOString(),
        notes,
        lead_id: parentType === 'lead' ? selectedParent.id : undefined,
        opportunity_id: parentType === 'opportunity' ? selectedParent.id : undefined,
        parentName: selectedParent.name,
        parentType: parentType === 'lead' ? 'Lead' : 'Opportunity',
      });
      onActivityScheduled();
      onClose();
    } catch (err) {
      setError('Failed to schedule activity.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule a Follow-up</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="parentType" className="text-right">
              For
            </Label>
            <Select onValueChange={(value: ParentType) => setParentType(value)} defaultValue={parentType}>
              <SelectTrigger id="parentType" className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="opportunity">Opportunity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              {parentType === 'lead' ? 'Lead' : 'Opportunity'}
            </Label>
            <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isComboboxOpen}
                  className="col-span-3 w-full justify-between"
                >
                  {selectedParent ? selectedParent.name : `Select ${parentType}...`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder={`Search ${parentType}...`} />
                  <CommandEmpty>{isLoading ? 'Loading...' : 'No results.'}</CommandEmpty>
                  <CommandGroup>
                    {parentItems.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.name}
                        onSelect={() => {
                          setSelectedParent(item);
                          setIsComboboxOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedParent?.id === item.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {item.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="activityType" className="text-right">
              Activity
            </Label>
            <Select onValueChange={(value: any) => setActivityType(value)} value={activityType}>
              <SelectTrigger id="activityType" className="col-span-3">
                <SelectValue placeholder="Select an activity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Call">Call</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="scheduledAt" className="text-right">
              Date & Time
            </Label>
            <Input
              id="scheduledAt"
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
              placeholder="Add notes (optional)"
            />
          </div>
          {error && <p className="col-span-4 text-red-500 text-sm text-center">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
