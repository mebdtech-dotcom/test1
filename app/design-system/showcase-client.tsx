"use client";

import * as React from "react";
import {
  Bell,
  Box,
  ChevronDown,
  Download,
  FileText,
  Filter,
  Inbox,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  ErrorState,
  Input,
  Label,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Spinner,
  StatCard,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui";

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex scroll-mt-24 flex-col gap-5">
      <div className="flex flex-col gap-1 border-b border-border pb-3">
        <h2 className="text-heading-md font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

const TOKEN_SWATCHES = [
  { name: "Background", className: "bg-background border border-border", text: "text-foreground" },
  { name: "Card", className: "bg-card border border-border", text: "text-card-foreground" },
  { name: "Primary", className: "bg-primary", text: "text-primary-foreground" },
  { name: "Secondary", className: "bg-secondary", text: "text-secondary-foreground" },
  { name: "Accent", className: "bg-accent", text: "text-accent-foreground" },
  { name: "Muted", className: "bg-muted", text: "text-muted-foreground" },
  { name: "Success", className: "bg-success", text: "text-success-foreground" },
  { name: "Warning", className: "bg-warning", text: "text-warning-foreground" },
  { name: "Info", className: "bg-info", text: "text-info-foreground" },
  { name: "Destructive", className: "bg-destructive", text: "text-destructive-foreground" },
];

const NAV = [
  { id: "tokens", label: "Color tokens" },
  { id: "typography", label: "Typography" },
  { id: "buttons", label: "Buttons" },
  { id: "badges", label: "Badges & status" },
  { id: "forms", label: "Form controls" },
  { id: "stats", label: "Stat cards" },
  { id: "cards", label: "Cards" },
  { id: "table", label: "Data table" },
  { id: "feedback", label: "Feedback" },
  { id: "states", label: "Empty & error" },
  { id: "overlays", label: "Overlays" },
  { id: "nav", label: "Navigation" },
];

export function ShowcaseClient() {
  const [page, setPage] = React.useState(2);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background">
        {/* Page banner */}
        <header className="border-b border-border bg-card">
          <div className="container flex flex-col gap-2 py-8">
            <Badge variant="info" className="w-fit">
              Wave 0 — Foundation
            </Badge>
            <h1 className="text-heading-xl font-bold tracking-tight text-foreground text-balance">
              iVendorz Design System
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty">
              The shared visual language for Bangladesh&apos;s integrated industrial B2B
              marketplace. Every component below is sourced from{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
                @/shared/ui
              </code>{" "}
              and themed entirely through design tokens.
            </p>
          </div>
        </header>

        <div className="container flex flex-col gap-12 py-10 lg:flex-row lg:gap-12">
          {/* Section nav */}
          <aside className="lg:w-56 lg:shrink-0">
            <nav className="flex flex-col gap-1 lg:sticky lg:top-8">
              <p className="px-3 py-2 text-caption font-semibold uppercase tracking-wide text-muted-foreground">
                On this page
              </p>
              {NAV.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Sections */}
          <main className="flex min-w-0 flex-1 flex-col gap-14">
            <Section
              id="tokens"
              title="Color tokens"
              description="Industrial blue brand, slate neutrals, and functional status colors. Never hard-code hex values — always reference semantic tokens."
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {TOKEN_SWATCHES.map((s) => (
                  <div
                    key={s.name}
                    className={`flex h-24 flex-col justify-end rounded-lg p-3 shadow-xs ${s.className}`}
                  >
                    <span className={`text-label font-medium ${s.text}`}>{s.name}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              id="typography"
              title="Typography"
              description="Inter for UI text, JetBrains Mono for tabular and code. A constrained, enterprise-grade type scale."
            >
              <Card>
                <CardContent className="flex flex-col gap-4 pt-6">
                  <p className="text-display font-bold text-foreground">Display 48</p>
                  <p className="text-heading-xl font-bold text-foreground">Heading XL 36</p>
                  <p className="text-heading-lg font-semibold text-foreground">Heading LG 30</p>
                  <p className="text-heading-md font-semibold text-foreground">Heading MD 24</p>
                  <p className="text-heading-sm font-semibold text-foreground">Heading SM 20</p>
                  <Separator />
                  <p className="text-base text-foreground">
                    Body base — Procurement teams compare verified suppliers, request quotations,
                    and track fulfillment across the industrial supply chain.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Small muted — supporting metadata and secondary descriptions.
                  </p>
                  <p className="text-label font-medium uppercase tracking-wide text-muted-foreground">
                    Label — form & section labels
                  </p>
                  <p className="font-mono text-sm text-foreground">
                    Mono — SKU-049-2261 · BDT 1,240,000.00
                  </p>
                </CardContent>
              </Card>
            </Section>

            <Section
              id="buttons"
              title="Buttons"
              description="Variants for primary actions, secondary flows, destructive operations and low-emphasis controls."
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Button>
                    <Plus data-icon="inline-start" />
                    Create RFQ
                  </Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">
                    <Filter data-icon="inline-start" />
                    Filter
                  </Button>
                  <Button variant="success">
                    <TrendingUp data-icon="inline-start" />
                    Approve
                  </Button>
                  <Button variant="destructive">Reject</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Learn more</Button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon" variant="outline" aria-label="Settings">
                    <Settings />
                  </Button>
                  <Button disabled>
                    <Spinner className="text-current" />
                    Processing
                  </Button>
                </div>
              </div>
            </Section>

            <Section
              id="badges"
              title="Badges & status"
              description="Compact labels for order states, supplier verification, and inventory signals."
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Draft</Badge>
                <Badge variant="success">Verified</Badge>
                <Badge variant="warning">Pending</Badge>
                <Badge variant="info">In transit</Badge>
                <Badge variant="destructive">Cancelled</Badge>
                <Badge variant="outline">Archived</Badge>
              </div>
            </Section>

            <Section
              id="forms"
              title="Form controls"
              description="Inputs, selects, toggles and choice controls with consistent focus rings and disabled states."
            >
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Text inputs</CardTitle>
                    <CardDescription>Labels, placeholders and multi-line entry.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="ds-company">Company name</Label>
                      <Input id="ds-company" placeholder="e.g. Meghna Industrial Ltd." />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="ds-email">Work email</Label>
                      <Input id="ds-email" type="email" placeholder="procurement@company.com" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="ds-note">Requirement notes</Label>
                      <Textarea
                        id="ds-note"
                        placeholder="Describe quantity, specs, delivery timeline…"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="ds-disabled">Disabled</Label>
                      <Input id="ds-disabled" disabled placeholder="Unavailable" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Selection</CardTitle>
                    <CardDescription>Dropdowns, switches and choice groups.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <Label>Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Industrial</SelectLabel>
                            <SelectItem value="machinery">Machinery & equipment</SelectItem>
                            <SelectItem value="raw">Raw materials</SelectItem>
                            <SelectItem value="electrical">Electrical & power</SelectItem>
                            <SelectItem value="safety">Safety & PPE</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Label>Delivery preference</Label>
                      <RadioGroup defaultValue="standard" className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="standard" id="r-standard" />
                          <Label htmlFor="r-standard" className="font-normal">
                            Standard (5–7 days)
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="express" id="r-express" />
                          <Label htmlFor="r-express" className="font-normal">
                            Express (48 hours)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox id="ds-terms" defaultChecked />
                      <Label htmlFor="ds-terms" className="font-normal">
                        Save as default shipping address
                      </Label>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex flex-col">
                        <Label htmlFor="ds-notify" className="font-medium">
                          Quote alerts
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          Notify me when suppliers respond
                        </span>
                      </div>
                      <Switch id="ds-notify" defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Section>

            <Section
              id="stats"
              title="Stat cards"
              description="KPI tiles for dashboards — value, trend delta and contextual icon."
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Active RFQs"
                  value="248"
                  icon={FileText}
                  trend="up"
                  change="+12.4%"
                  caption="vs last month"
                />
                <StatCard
                  label="Verified suppliers"
                  value="1,932"
                  icon={Users}
                  trend="up"
                  change="+3.1%"
                  caption="vs last month"
                />
                <StatCard
                  label="Orders in transit"
                  value="74"
                  icon={Package}
                  trend="down"
                  change="-2.0%"
                  caption="vs last week"
                />
                <StatCard
                  label="GMV (BDT)"
                  value="BDT 48.2M"
                  icon={ShoppingCart}
                  trend="up"
                  change="+8.7%"
                  caption="vs last month"
                />
              </div>
            </Section>

            <Section
              id="cards"
              title="Cards"
              description="Composable container with header, content and footer regions."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <CardTitle>Hydraulic Press — 60T</CardTitle>
                        <CardDescription>SKU-049-2261 · Meghna Industrial</CardDescription>
                      </div>
                      <Badge variant="success">Verified</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Heavy-duty industrial press suitable for metal forming and assembly lines.
                      Minimum order quantity 1 unit.
                    </p>
                    <p className="font-mono text-heading-sm font-semibold text-foreground">
                      BDT 1,240,000
                    </p>
                  </CardContent>
                  <CardFooter className="gap-3">
                    <Button className="flex-1">Request quote</Button>
                    <Button variant="outline" size="icon" aria-label="Save">
                      <Box />
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Supplier snapshot</CardTitle>
                    <CardDescription>Meghna Industrial Ltd.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="/diverse-business-team.png" alt="" />
                        <AvatarFallback>MI</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          Meghna Industrial Ltd.
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Narayanganj · Since 2014
                        </span>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Response rate</span>
                        <span className="font-medium text-foreground">96%</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">On-time delivery</span>
                        <span className="font-medium text-foreground">92%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Section>

            <Section
              id="table"
              title="Data table"
              description="Dense, scannable rows for orders, quotes and inventory."
            >
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        id: "ORD-10293",
                        supplier: "Meghna Industrial",
                        status: "In transit",
                        v: "info",
                        amt: "BDT 1,240,000",
                      },
                      {
                        id: "ORD-10288",
                        supplier: "Bengal Steel Co.",
                        status: "Verified",
                        v: "success",
                        amt: "BDT 845,500",
                      },
                      {
                        id: "ORD-10271",
                        supplier: "Padma Traders",
                        status: "Pending",
                        v: "warning",
                        amt: "BDT 312,000",
                      },
                      {
                        id: "ORD-10250",
                        supplier: "Jamuna Supplies",
                        status: "Cancelled",
                        v: "destructive",
                        amt: "BDT 96,750",
                      },
                    ].map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono font-medium">{row.id}</TableCell>
                        <TableCell>{row.supplier}</TableCell>
                        <TableCell>
                          <Badge variant={row.v as "info" | "success" | "warning" | "destructive"}>
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">{row.amt}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label="Row actions">
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                <DropdownMenuItem>View details</DropdownMenuItem>
                                <DropdownMenuItem>Download invoice</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Cancel order
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between border-t border-border px-4 py-3">
                  <span className="text-sm text-muted-foreground">Showing 4 of 248 orders</span>
                  <Pagination className="mx-0 w-auto justify-end">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage((p) => Math.max(1, p - 1));
                          }}
                        />
                      </PaginationItem>
                      {[1, 2, 3].map((n) => (
                        <PaginationItem key={n}>
                          <PaginationLink
                            href="#"
                            isActive={n === page}
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(n);
                            }}
                          >
                            {n}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage((p) => Math.min(3, p + 1));
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </Card>
            </Section>

            <Section
              id="feedback"
              title="Feedback"
              description="Alerts, loading skeletons and spinners for asynchronous states."
            >
              <div className="flex flex-col gap-4">
                <Alert>
                  <Bell />
                  <AlertTitle>Heads up</AlertTitle>
                  <AlertDescription>
                    Your supplier verification documents expire in 14 days.
                  </AlertDescription>
                </Alert>
                <Alert variant="success">
                  <TrendingUp />
                  <AlertTitle>Quote accepted</AlertTitle>
                  <AlertDescription>
                    Bengal Steel Co. accepted your quotation for ORD-10288.
                  </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <Bell />
                  <AlertTitle>Payment failed</AlertTitle>
                  <AlertDescription>
                    We couldn&apos;t process the payment for ORD-10250. Please update your method.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardContent className="flex flex-col gap-4 pt-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-12 rounded-full" />
                      <div className="flex flex-1 flex-col gap-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-24 w-full" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Spinner />
                      Loading supplier catalog…
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Section>

            <Section
              id="states"
              title="Empty & error states"
              description="Standardized placeholders for no-data and failed-load scenarios."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <EmptyState
                  icon={Inbox}
                  title="No quotations yet"
                  description="When suppliers respond to your RFQs, their quotes will appear here."
                  action={
                    <Button>
                      <Plus data-icon="inline-start" />
                      Create RFQ
                    </Button>
                  }
                />
                <ErrorState
                  title="Couldn't load orders"
                  description="There was a problem reaching the order service."
                  onRetry={() => {}}
                />
              </div>
            </Section>

            <Section
              id="overlays"
              title="Overlays"
              description="Dialogs, side drawers, dropdown menus and tooltips with managed focus and stacking."
            >
              <div className="flex flex-wrap items-center gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Open dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm quotation request</DialogTitle>
                      <DialogDescription>
                        We&apos;ll send your requirements to 3 verified suppliers in this category.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="dlg-qty">Quantity</Label>
                      <Input id="dlg-qty" type="number" defaultValue={10} />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button>Send request</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline">
                      <Filter data-icon="inline-start" />
                      Open filters
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Filter suppliers</DrawerTitle>
                      <DrawerDescription>Narrow results by location and rating.</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex flex-1 flex-col gap-4 px-6">
                      <div className="flex flex-col gap-2">
                        <Label>Division</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="All divisions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dhaka">Dhaka</SelectItem>
                            <SelectItem value="chattogram">Chattogram</SelectItem>
                            <SelectItem value="khulna">Khulna</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="f-verified" defaultChecked />
                        <Label htmlFor="f-verified" className="font-normal">
                          Verified suppliers only
                        </Label>
                      </div>
                    </div>
                    <DrawerFooter>
                      <Button>Apply filters</Button>
                      <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Actions
                      <ChevronDown data-icon="inline-end" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Manage</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Download data-icon="inline-start" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings data-icon="inline-start" />
                        Settings
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Search">
                      <Search />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Search catalog</TooltipContent>
                </Tooltip>
              </div>
            </Section>

            <Section
              id="nav"
              title="Navigation"
              description="Breadcrumbs and tabs for wayfinding within dense workflows."
            >
              <div className="flex flex-col gap-6">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Orders</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>ORD-10293</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>

                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="items">Line items</TabsTrigger>
                    <TabsTrigger value="docs">Documents</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview">
                    <Card>
                      <CardContent className="pt-6 text-sm leading-relaxed text-muted-foreground">
                        Order summary, supplier details and fulfillment timeline.
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="items">
                    <Card>
                      <CardContent className="pt-6 text-sm leading-relaxed text-muted-foreground">
                        Itemized list of products, quantities and unit pricing.
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="docs">
                    <Card>
                      <CardContent className="pt-6 text-sm leading-relaxed text-muted-foreground">
                        Invoices, purchase orders and compliance certificates.
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </Section>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
