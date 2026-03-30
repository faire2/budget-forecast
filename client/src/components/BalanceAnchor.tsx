import { useState, useEffect } from 'react';
import { format } from 'date-fns';

type BalanceAnchorProps = {
  balance: number; // Balance in cents
  asOfDate: string; // ISO date string (YYYY-MM-DD)
  onUpdate: (balance: number) => void;
};

/**
 * BalanceAnchor Component
 *
 * Displays and allows editing of the current balance anchor.
 * The balance anchor represents the user's current balance as of today,
 * which serves as the starting point for all forecast calculations.
 */
export function BalanceAnchor({ balance, asOfDate, onUpdate }: BalanceAnchorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Format balance in cents to dollars for display
  const formatCurrency = (cents: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // Format date for display
  const formatDate = (dateStr: string): string => {
    return format(new Date(dateStr), 'MMMM d, yyyy');
  };

  // Initialize input value when editing starts
  useEffect(() => {
    if (isEditing) {
      setInputValue((balance / 100).toFixed(2));
    }
  }, [isEditing, balance]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);

    // Parse input value and convert to cents
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      const cents = Math.round(parsed * 100);
      if (cents !== balance) {
        onUpdate(cents);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue((balance / 100).toFixed(2));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">
          Current Balance
        </label>

        {isEditing ? (
          <input
            type="text"
            inputMode="decimal"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="text-3xl font-semibold bg-input border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        ) : (
          <button
            onClick={handleClick}
            className="text-left text-3xl font-semibold text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded-md px-3 py-2 -mx-3"
          >
            {formatCurrency(balance)}
          </button>
        )}

        <p className="text-xs text-muted-foreground">
          as of {formatDate(asOfDate)}
        </p>
      </div>
    </div>
  );
}
