import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * iv-money — generic money renderer primitive.
 *
 * Renders `{ amount, currency }` EXACTLY as passed. Default currency is BDT.
 * It never assumes `$`/USD and never uses `Intl` currency defaults — formatting
 * decisions (locale grouping, fraction digits, symbol vs. code) belong to the
 * caller / the governed `currency-display` that composes from this primitive.
 *
 * `amount` is accepted as a pre-formatted string (preferred) or a number that
 * is rendered with `String(amount)` only — no locale/Intl transformation.
 */
export interface IvMoneyProps extends Omit<React.ComponentProps<"span">, "children"> {
  amount: string | number;
  /** ISO-style currency code. Defaults to "BDT". Caller-supplied otherwise. */
  currency?: string;
  /** Where the currency code sits relative to the amount. */
  currencyPosition?: "leading" | "trailing";
}

function IvMoney({
  amount,
  currency = "BDT",
  currencyPosition = "leading",
  className,
  ...props
}: IvMoneyProps) {
  const value = typeof amount === "number" ? String(amount) : amount;

  return (
    <span
      data-slot="iv-money"
      className={cn("iv-money inline-flex items-baseline gap-1 tabular-nums", className)}
      {...props}
    >
      {currencyPosition === "leading" ? (
        <>
          <span className="iv-money-currency text-muted-foreground">{currency}</span>
          <span className="iv-money-amount">{value}</span>
        </>
      ) : (
        <>
          <span className="iv-money-amount">{value}</span>
          <span className="iv-money-currency text-muted-foreground">{currency}</span>
        </>
      )}
    </span>
  );
}

export { IvMoney };
