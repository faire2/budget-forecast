import { useState } from 'react';
import { addDays, format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BalanceAnchor } from './components/BalanceAnchor';
import { EntryForm, type EntryFormData } from './components/EntryForm';
import { DayList } from './components/DayList';
import { Calendar } from './components/Calendar';
import { EditOccurrenceDialog } from './components/EditOccurrenceDialog';
import { useForecasts } from './hooks/useForecasts';

function App() {
  const [balance, setBalance] = useState(50000); // $500.00 in cents
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState<string>('');
  const [editingNote, setEditingNote] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const endDate = format(addDays(today, 29), 'yyyy-MM-dd');

  // Fetch forecast data
  const { data: forecasts, isLoading, isError, error } = useForecasts(todayStr, endDate);

  // Balance update mutation
  const balanceMutation = useMutation({
    mutationFn: async (newBalance: number) => {
      const response = await fetch('/api/balance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          balance: (newBalance / 100).toFixed(2), // Convert cents to decimal string
          asOfDate: todayStr,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to update balance: ${response.status} ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecasts'] });
    },
  });

  // Entry creation mutation
  const entryMutation = useMutation({
    mutationFn: async (data: EntryFormData) => {
      const payload: Record<string, unknown> = {
        amount: (data.amount / 100).toFixed(2), // Convert cents to decimal string
        type: data.type,
        note: data.note || null,
      };

      // Add appropriate fields based on entry type
      if (data.recurringRule && data.recurringStartDate) {
        // Recurring entry
        payload.recurringRule = data.recurringRule;
        payload.recurringStartDate = data.recurringStartDate;
      } else if (data.date) {
        // One-time entry
        payload.date = data.date;
      }

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to create entry: ${response.status} ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecasts'] });
      setShowEntryForm(false);
    },
  });

  // Skip occurrence mutation
  const skipOccurrenceMutation = useMutation({
    mutationFn: async ({ entryId, date }: { entryId: number; date: string }) => {
      const response = await fetch(`/api/entries/${entryId}/occurrences/${date}/skip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to skip occurrence: ${response.status} ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecasts'] });
    },
  });

  // Edit occurrence mutation
  const editOccurrenceMutation = useMutation({
    mutationFn: async ({
      entryId,
      date,
      data,
    }: {
      entryId: number;
      date: string;
      data: { overrideAmount?: string; overrideNote?: string | null };
    }) => {
      const response = await fetch(`/api/entries/${entryId}/occurrences/${date}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to edit occurrence: ${response.status} ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecasts'] });
      setIsEditDialogOpen(false);
      setEditingEntryId(null);
      setEditingDate(null);
    },
  });

  // Delete entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: number) => {
      const response = await fetch(`/api/entries/${entryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to delete entry: ${response.status} ${errorText}`);
      }

      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecasts'] });
    },
  });

  const handleBalanceUpdate = (newBalance: number) => {
    setBalance(newBalance);
    balanceMutation.mutate(newBalance);
  };

  const handleEntrySubmit = (data: EntryFormData) => {
    entryMutation.mutate(data);
  };

  const handleDayClick = (date: string) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  const handleSkipOccurrence = (entryId: number, date: string) => {
    skipOccurrenceMutation.mutate({ entryId, date });
  };

  const handleEditOccurrence = (entryId: number, date: string) => {
    // Find the entry details from forecasts to populate the dialog
    const day = forecasts?.find((d) => d.date === date);
    const entry = day?.entries.find((e) => e.id === entryId);

    if (entry) {
      setEditingEntryId(entryId);
      setEditingDate(date);
      setEditingAmount(entry.amount);
      setEditingNote(entry.note);
      setIsEditDialogOpen(true);
    }
  };

  const handleEditOccurrenceSubmit = (data: { overrideAmount?: string; overrideNote?: string | null }) => {
    if (editingEntryId !== null && editingDate !== null) {
      editOccurrenceMutation.mutate({
        entryId: editingEntryId,
        date: editingDate,
        data,
      });
    }
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingEntryId(null);
    setEditingDate(null);
  };

  const handleDeleteEntry = (entryId: number) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      deleteEntryMutation.mutate(entryId);
    }
  };

  const handleCalendarDateSelect = (date: string) => {
    // Expand the selected date in the day list
    setExpandedDate(date);

    // Scroll to the selected date after a short delay to allow DOM update
    setTimeout(() => {
      const element = document.getElementById(`day-${date}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
  };

  // Extract dates that have entries for calendar highlighting
  const datesWithEntries = forecasts?.map((day) => day.date).filter((date) => {
    const day = forecasts.find((d) => d.date === date);
    return day && day.entries.length > 0;
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">
            Budget Forecast
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your income and expenses with 30-day projections
          </p>
        </header>

        {/* Balance Anchor Section */}
        <section className="mb-8">
          <BalanceAnchor
            balance={balance}
            asOfDate={todayStr}
            onUpdate={handleBalanceUpdate}
          />
          {balanceMutation.isPending && (
            <div className="mt-2 text-sm text-muted-foreground">
              Updating balance...
            </div>
          )}
          {balanceMutation.isError && (
            <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
              {balanceMutation.error?.message || 'Failed to update balance'}
            </div>
          )}
        </section>

        {/* Entry Form Section */}
        <section className="mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Entry</h2>
              {!showEntryForm && (
                <button
                  onClick={() => setShowEntryForm(true)}
                  className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Add new income or expense entry"
                >
                  New Entry
                </button>
              )}
            </div>
            {showEntryForm ? (
              <>
                <EntryForm
                  onSubmit={handleEntrySubmit}
                  onCancel={() => setShowEntryForm(false)}
                />
                {entryMutation.isPending && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                    Creating entry...
                  </div>
                )}
                {entryMutation.isError && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                    {entryMutation.error?.message || 'Failed to create entry'}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click "New Entry" to add income or expense
              </p>
            )}
          </div>
        </section>

        {/* Calendar Section */}
        <section className="mb-8">
          <Calendar
            selectedDate={expandedDate}
            datesWithEntries={datesWithEntries}
            onDateSelect={handleCalendarDateSelect}
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
          />
        </section>

        {/* Forecast Section */}
        <section>
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">30-Day Forecast</h2>

            {isLoading && (
              <p className="text-sm text-muted-foreground">Loading forecast...</p>
            )}

            {isError && (
              <div className="text-sm text-destructive">
                Error loading forecast: {error?.message || 'Unknown error'}
              </div>
            )}

            {forecasts && forecasts.length > 0 && (
              <>
                <DayList
                  days={forecasts}
                  expandedDate={expandedDate}
                  onDayClick={handleDayClick}
                  onSkipOccurrence={handleSkipOccurrence}
                  onEditOccurrence={handleEditOccurrence}
                  onDeleteEntry={handleDeleteEntry}
                />
                {(skipOccurrenceMutation.isPending || deleteEntryMutation.isPending) && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                    Updating occurrence...
                  </div>
                )}
                {(skipOccurrenceMutation.isError || deleteEntryMutation.isError) && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                    {skipOccurrenceMutation.error?.message || deleteEntryMutation.error?.message || 'Failed to update entry'}
                  </div>
                )}
              </>
            )}

            {forecasts && forecasts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No forecast data available
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Edit Occurrence Dialog */}
      {isEditDialogOpen && editingEntryId !== null && editingDate !== null && (
        <EditOccurrenceDialog
          isOpen={isEditDialogOpen}
          date={editingDate}
          originalAmount={editingAmount}
          originalNote={editingNote}
          onSubmit={handleEditOccurrenceSubmit}
          onClose={handleEditDialogClose}
        />
      )}
    </div>
  );
}

export default App;
