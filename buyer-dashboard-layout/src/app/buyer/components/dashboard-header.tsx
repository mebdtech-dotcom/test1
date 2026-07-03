"use client";

import { Bell, ChevronDown, HelpCircle, MessageSquare, Search } from "lucide-react";
import { useState } from "react";

import { IvButton } from "@/components/iv/iv-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** A selectable company in the switcher. Supplied by the caller. */
export interface CompanyOption {
  id: string;
  name: string;
}

/** A single entry in the buyer profile dropdown. Caller-supplied. */
export interface ProfileMenuItem {
  id: string;
  label: string;
  /** Optional pre-rendered leading icon. */
  icon?: React.ReactNode;
  /** Presentation tone; `destructive` styles the item accordingly. */
  variant?: "default" | "destructive";
}

export interface DashboardHeaderProps {
  /** Greeting prefix, e.g. "Good Morning". */
  greeting: string;
  /** Display name shown after the greeting and in the profile dropdown. */
  userName: string;
  /** Company name shown in the meta line and as the switcher value. */
  companyName: string;
  /** Role label shown in the meta line and profile dropdown. */
  role: string;
  /** Optional avatar image URL. Falls back to initials. */
  avatarSrc?: string;
  /** Avatar fallback initials. */
  initials?: string;
  /** Companies for the switcher. When omitted, the switcher is a placeholder. */
  companies?: CompanyOption[];
  /** Currently selected company id (controlled by the caller's value if given). */
  selectedCompanyId?: string;
  /** Search field placeholder. */
  searchPlaceholder?: string;
  /** Notifications summary (e.g. "3 unread"); `null` shows no indicator. */
  notificationsLabel?: string | null;
  /** Messages summary (e.g. "2 new"); `null` shows no indicator. */
  messagesLabel?: string | null;
  /** Entries rendered in the buyer profile dropdown. */
  profileItems?: ProfileMenuItem[];
}

/**
 * DashboardHeader — pure presentation header for the buyer dashboard content
 * area. Composes only existing registry primitives. It performs no data
 * access and holds ephemeral search state only; all content arrives via props.
 */
export function DashboardHeader({
  greeting,
  userName,
  companyName,
  role,
  avatarSrc,
  initials,
  companies,
  selectedCompanyId,
  searchPlaceholder = "Search RFQs, suppliers, orders…",
  notificationsLabel = null,
  messagesLabel = null,
  profileItems = [],
}: DashboardHeaderProps) {
  // Ephemeral UI state only — no fetching, no persistence.
  const [query, setQuery] = useState("");

  const hasCompanies = Array.isArray(companies) && companies.length > 0;

  return (
    <section
      aria-label="Dashboard header"
      className="flex flex-col gap-4 rounded-[var(--radius)] border border-border bg-card p-4 sm:p-6"
    >
      {/* Utility row: company switcher · search · actions · profile */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Company switcher (placeholder until companies are wired) */}
        {hasCompanies ? (
          <Select defaultValue={selectedCompanyId ?? companies![0]?.id}>
            <SelectTrigger aria-label="Switch company" className="w-full min-w-0 sm:w-56">
              <SelectValue placeholder={companyName} />
            </SelectTrigger>
            <SelectContent>
              {companies!.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Select disabled>
            <SelectTrigger aria-label="Switch company" className="w-full min-w-0 sm:w-56">
              <SelectValue placeholder={companyName} />
            </SelectTrigger>
            <SelectContent />
          </Select>
        )}

        {/* Global search */}
        <div className="relative ml-auto w-full min-w-0 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search"
            className="pl-9"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <IvButton
            variant="ghost"
            size="sm"
            className="relative"
            aria-label={
              notificationsLabel ? `Notifications, ${notificationsLabel}` : "Notifications"
            }
          >
            <Bell className="size-5" />
            {notificationsLabel ? (
              <span
                className="absolute right-1 top-1 size-2 rounded-full bg-destructive ring-2 ring-card"
                aria-hidden="true"
              />
            ) : null}
          </IvButton>

          <IvButton
            variant="ghost"
            size="sm"
            className="relative"
            aria-label={messagesLabel ? `Messages, ${messagesLabel}` : "Messages"}
          >
            <MessageSquare className="size-5" />
            {messagesLabel ? (
              <span
                className="absolute right-1 top-1 size-2 rounded-full bg-destructive ring-2 ring-card"
                aria-hidden="true"
              />
            ) : null}
          </IvButton>

          <IvButton variant="ghost" size="sm" aria-label="Help">
            <HelpCircle className="size-5" />
          </IvButton>

          {/* Buyer profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-2 rounded-[var(--radius)] p-1 pr-2 text-left",
                  "outline-none hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                )}
                aria-label="Open buyer profile menu"
              >
                <Avatar>
                  {avatarSrc ? <AvatarImage src={avatarSrc} alt="" /> : null}
                  <AvatarFallback className="text-xs font-medium">{initials ?? "—"}</AvatarFallback>
                </Avatar>
                <span className="hidden min-w-0 leading-tight sm:flex sm:flex-col">
                  <span className="truncate text-sm font-medium text-foreground">{userName}</span>
                  <span className="truncate text-xs text-muted-foreground">{role}</span>
                </span>
                <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="truncate text-sm font-medium text-foreground">{userName}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {companyName} · {role}
                </span>
              </DropdownMenuLabel>
              {profileItems.length > 0 ? (
                <>
                  <DropdownMenuSeparator />
                  {profileItems.map((item) => (
                    <DropdownMenuItem key={item.id} variant={item.variant}>
                      {item.icon}
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Greeting */}
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight text-balance text-foreground">
          {greeting}, {userName}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground text-pretty">
          {companyName} · {role}
        </p>
      </div>
    </section>
  );
}
