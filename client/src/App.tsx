import { useState, useEffect } from 'react';
import { addDays, format } from 'date-fns';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { BalanceAnchor } from './components/BalanceAnchor';
import { EntryDialog, type EntryFormData } from './components/EntryDialog';
import { DayListCompact } from './components/DayListCompact';
import { Calendar } from './components/Calendar';
import { useForecasts } from './hooks/useForecasts';
import {
  getAllForecastQueries,
  recalculateBalances,
  addEntryToCache,
  updateEntryInCache,
  removeEntryFromCache,
  updateEntryOverrideInCache,
} from './lib/optimistic-updates';
import type { DailyProjection } from './types/forecast';

function App() {
  const [balance, setBalance] = useState(0); // Will be fetched from API
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [forecastStartDate, setForecastStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Entry dialog state
  const [entryDialogState, setEntryDialogState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    date: string;
    entryData?: {
      entryId: number;
      amount: string; // cents
      type: 'income' | 'expense';
      note: string | null;
      date: string;
      isRecurring: boolean;
    };
  }>({
    isOpen: false,
    mode: 'create',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const queryClient = useQueryClient();

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // Calculate end date based on forecast start date (30 days from start)
  const forecastEndDate = format(addDays(new Date(forecastStartDate), 29), 'yyyy-MM-dd');

  // Fetch forecast data using dynamic start date
  const { data: forecasts, isLoading, isError, error } = useForecasts(forecastStartDate, forecastEndDate);

  // Get API base URL from environment variable (for local dev)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

  // Fetch balance from API
  const { data: balanceData } = useQuery({
    queryKey: ['balance'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/balance`);
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      return response.json();
    },
  });

  // Update local balance state when API data arrives
  useEffect(() => {
    if (balanceData?.balance) {
      const balanceInCents = Math.round(parseFloat(balanceData.balance) * 100);
      setBalance(balanceInCents);
    }
  }, [balanceData]);

  // Balance update mutation with optimistic updates
  const balanceMutation = useMutation({
    mutationFn: async (newBalance: number) => {
      const response = await fetch(`${API_BASE_URL}/api/balance`, {
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
    onMutate: async (newBalance) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['forecasts'] });

      // Snapshot current cache
      const forecastQueries = getAllForecastQueries(queryClient);
      const previousForecasts = forecastQueries.map(key => ({
        key,
        data: queryClient.getQueryData(key),
      }));
      const previousBalance = queryClient.getQueryData(['balance']);

      // Optimistically update all forecast queries
      forecastQueries.forEach(queryKey => {
        const data = queryClient.getQueryData<DailyProjection[]>(queryKey);
        if (data) {
          const updated = recalculateBalances(data, newBalance);
          queryClient.setQueryData(queryKey, updated);
        }
      });

      // Optimistically update balance query
      queryClient.setQueryData(['balance'], {
        balance: (newBalance / 100).toFixed(2),
        asOfDate: todayStr,
      });

      return { previousForecasts, previousBalance };
    },
    onError: (_err, _newBalance, context) => {
      // Rollback forecasts
      if (context?.previousForecasts) {
        context.previousForecasts.forEach(({ key, data }) => {
          queryClient.setQueryData(key, data);
        });
      }
      // Rollback balance
      if (context?.previousBalance) {
        queryClient.setQueryData(['balance'], context.previousBalance);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['forecasts'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });

  // Entry creation mutation with optimistic updates
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

      const response = await fetch(`${API_BASE_URL}/api/entries`, {
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
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['forecasts'] });

      // Snapshot cache
      const forecastQueries = getAllForecastQueries(queryClient);
      const previousData = forecastQueries.map(key => ({
        key,
        data: queryClient.getQueryData(key),
      }));

      // Get current balance for recalculation
      const balanceData = queryClient.getQueryData<{ balance: string }>(['balance']);
      const startingBalance = balanceData ? parseFloat(balanceData.balance) * 100 : 0;

      // Create optimistic entry with temporary ID
      const optimisticEntry = {
        id: Date.now(), // Temporary ID
        amount: data.amount.toString(),
        type: data.type,
        note: data.note || null,
        isRecurring: !!data.recurringRule,
        isSkipped: false,
      };

      // Update all forecast queries
      const targetDate = data.date || data.recurringStartDate;
      if (targetDate) {
        forecastQueries.forEach(queryKey => {
          const cachedData = queryClient.getQueryData<DailyProjection[]>(queryKey);
          if (cachedData) {
            const updated = addEntryToCache(
              cachedData,
              optimisticEntry,
              targetDate,
              startingBalance
            );
            queryClient.setQueryData(queryKey, updated);
          }
        });
      }

      return { previousData };
    },
    onError: (_err, _data, context) => {
      if (context?.previousData) {
        context.previousData.forEach(({ key, data }) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['forecasts'] });
    },
  });

  // Edit occurrence mutation with optimistic updates
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
      const response = await fetch(`${API_BASE_URL}/api/entries/${entryId}/occurrences/${date}/edit`, {
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
    onMutate: async ({ entryId, date, data }) => {
      await queryClient.cancelQueries({ queryKey: ['forecasts'] });

      const forecastQueries = getAllForecastQueries(queryClient);
      const previousData = forecastQueries.map(key => ({
        key,
        data: queryClient.getQueryData(key),
      }));

      forecastQueries.forEach(queryKey => {
        const cachedData = queryClient.getQueryData<DailyProjection[]>(queryKey);
        if (cachedData) {
          const updated = updateEntryOverrideInCache(
            cachedData,
            entryId,
            date,
            data.overrideAmount,
            data.overrideNote
          );
          queryClient.setQueryData(queryKey, updated);
        }
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(({ key, data }) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['forecasts'] });
    },
  });

  // Delete entry mutation with optimistic updates
  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: number) => {
      const response = await fetch(`${API_BASE_URL}/api/entries/${entryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to delete entry: ${response.status} ${errorText}`);
      }

      return;
    },
    onMutate: async (entryId) => {
      await queryClient.cancelQueries({ queryKey: ['forecasts'] });

      const forecastQueries = getAllForecastQueries(queryClient);
      const previousData = forecastQueries.map(key => ({
        key,
        data: queryClient.getQueryData(key),
      }));

      const balanceData = queryClient.getQueryData<{ balance: string }>(['balance']);
      const startingBalance = balanceData ? parseFloat(balanceData.balance) * 100 : 0;

      forecastQueries.forEach(queryKey => {
        const cachedData = queryClient.getQueryData<DailyProjection[]>(queryKey);
        if (cachedData) {
          const updated = removeEntryFromCache(cachedData, entryId, startingBalance);
          queryClient.setQueryData(queryKey, updated);
        }
      });

      return { previousData };
    },
    onError: (_err, _entryId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(({ key, data }) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['forecasts'] });
    },
  });

  // Update entry mutation (for one-time entries) with optimistic updates
  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EntryFormData }) => {
      const response = await fetch(`${API_BASE_URL}/api/entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: (data.amount / 100).toFixed(2),
          type: data.type,
          note: data.note || null,
          date: data.date,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to update entry: ${response.status} ${errorText}`);
      }

      return response.json();
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['forecasts'] });

      const forecastQueries = getAllForecastQueries(queryClient);
      const previousData = forecastQueries.map(key => ({
        key,
        data: queryClient.getQueryData(key),
      }));

      const balanceData = queryClient.getQueryData<{ balance: string }>(['balance']);
      const startingBalance = balanceData ? parseFloat(balanceData.balance) * 100 : 0;

      forecastQueries.forEach(queryKey => {
        const cachedData = queryClient.getQueryData<DailyProjection[]>(queryKey);
        if (cachedData) {
          const updated = updateEntryInCache(cachedData, id, data, startingBalance);
          queryClient.setQueryData(queryKey, updated);
        }
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(({ key, data }) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['forecasts'] });
    },
  });

  const handleBalanceUpdate = (newBalance: number) => {
    setBalance(newBalance);
    balanceMutation.mutate(newBalance);
  };

  const handleAddEntry = (date: string) => {
    setEntryDialogState({
      isOpen: true,
      mode: 'create',
      date,
    });
  };

  const handleEntryClick = (entryId: number, date: string) => {
    // Find the entry details from forecasts
    const day = forecasts?.find((d) => d.date === date);
    const entry = day?.entries.find((e) => e.id === entryId);

    if (entry) {
      setEntryDialogState({
        isOpen: true,
        mode: 'edit',
        date,
        entryData: {
          entryId,
          amount: entry.amount,
          type: entry.type,
          note: entry.note,
          date,
          isRecurring: entry.isRecurring,
        },
      });
    }
  };

  const handleDialogSubmit = (data: EntryFormData) => {
    if (entryDialogState.mode === 'create') {
      // Create new entry
      entryMutation.mutate(data);
    } else if (entryDialogState.mode === 'edit' && entryDialogState.entryData) {
      const { entryId, isRecurring } = entryDialogState.entryData;

      if (isRecurring) {
        // For recurring entries, create an override
        const overrideData: { overrideAmount?: string; overrideNote?: string | null } = {};

        // Compare with original values
        const originalAmountCents = parseFloat(entryDialogState.entryData.amount);
        if (data.amount !== originalAmountCents) {
          overrideData.overrideAmount = (data.amount / 100).toFixed(2);
        }

        if (data.note !== (entryDialogState.entryData.note || '')) {
          overrideData.overrideNote = data.note || null;
        }

        if (Object.keys(overrideData).length > 0) {
          editOccurrenceMutation.mutate({
            entryId,
            date: entryDialogState.date,
            data: overrideData,
          });
        }
      } else {
        // For one-time entries, update the full entry
        updateEntryMutation.mutate({ id: entryId, data });
      }
    }
  };

  const handleDialogClose = () => {
    setEntryDialogState({
      ...entryDialogState,
      isOpen: false,
    });
  };

  const handleDeleteEntry = () => {
    if (entryDialogState.entryData) {
      deleteEntryMutation.mutate(entryDialogState.entryData.entryId);
    }
  };

  const handleCalendarDateSelect = (date: string) => {
    // Set the selected date as the new forecast start date
    // This will trigger a re-fetch of forecasts starting from the clicked date
    setForecastStartDate(date);
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

        {/* Two-Panel Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[400px_1fr] gap-6">
          {/* Left Panel: Balance + Calendar */}
          <section className="space-y-6">
            {/* Balance Anchor */}
            <div>
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
            </div>

            {/* Calendar */}
            <Calendar
              selectedDate={null}
              datesWithEntries={datesWithEntries}
              onDateSelect={handleCalendarDateSelect}
              currentMonth={currentMonth}
              onMonthChange={handleMonthChange}
            />
          </section>

          {/* Right Panel: Day List */}
          <section>
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
              <DayListCompact
                days={forecasts}
                onEntryClick={handleEntryClick}
                onAddEntry={handleAddEntry}
              />
            )}

            {forecasts && forecasts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No forecast data available
              </p>
            )}
          </section>
        </div>
      </div>

      {/* Entry Dialog */}
      <EntryDialog
        isOpen={entryDialogState.isOpen}
        mode={entryDialogState.mode}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        defaultDate={entryDialogState.date}
        {...(entryDialogState.entryData && { initialData: entryDialogState.entryData })}
        {...(entryDialogState.mode === 'edit' && { onDelete: handleDeleteEntry })}
      />

      {/* Loading/Error States */}
      {(entryMutation.isPending || updateEntryMutation.isPending || editOccurrenceMutation.isPending || deleteEntryMutation.isPending) && (
        <div className="fixed bottom-4 right-4 p-4 bg-card border border-border rounded-lg shadow-lg">
          <p className="text-sm text-muted-foreground">Processing...</p>
        </div>
      )}

      {(entryMutation.isError || updateEntryMutation.isError || editOccurrenceMutation.isError || deleteEntryMutation.isError) && (
        <div className="fixed bottom-4 right-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg shadow-lg">
          <p className="text-sm text-destructive">
            {entryMutation.error?.message ||
             updateEntryMutation.error?.message ||
             editOccurrenceMutation.error?.message ||
             deleteEntryMutation.error?.message ||
             'Operation failed'}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
