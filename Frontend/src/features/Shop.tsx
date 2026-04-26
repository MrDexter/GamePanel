import { useState, useEffect } from 'react'
// import { toast } from "sonner"
import {Input } from "@/components/ui/input"
import {Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import { formatMoney, useQueryParams} from "@/lib/constants"
// import { useLocation, useNavigate   } from "react-router-dom"
import { apiFetch } from "@/lib/api"
// import LoadingOverlay from "@/components/modals/Loading"
import { ChevronLeft, ChevronRight, X, ArrowUp } from "lucide-react"
// import { useAuth } from "@/lib/AuthContext"
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"


export default function Shop() {
    // const { user, perms } = useAuth();
    const { searchParams, updateParams } = useQueryParams();
    const search = searchParams.get("search") ?? "";
    const orderby = searchParams.get("orderby") ?? "name";
    const direction = searchParams.get("direction") ?? "asc";
    // const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const currentPage = Number(searchParams.get("page") ?? 1);
    const [totalRows, setTotalRows] = useState(1);
    const itemPerPage = 12;
    const totalPages = Math.max(1, Math.ceil(totalRows / itemPerPage));
    const offset = Math.max(0, (itemPerPage * (currentPage - 1)));

    const ORDER_OPTIONS = [
        { value: "name", label: "Name", entry: "name" },
        { value: "price", label: "Price", entry: "bankacc" },
    ] as const;

    const fetchProducts = async () => {
        try {
            // setIsLoading(true);
            const res = await apiFetch("GET", `/shop/products`)
            if (!res.ok) {
                setResults([]);
            };
            const data = await res.json();
            setResults(data.products);
            setTotalRows(data.totalProducts)
            console.log(data)
        } catch (error) {
            setResults([]);
            console.error("Fetch Error", error);
        }
    };

    useEffect(() => {
        const delayedSearch = setTimeout(async () => {
            // setIsLoading(true);
            fetchProducts()
        }, search.trim() ? 500 : 0);
        return () => clearTimeout(delayedSearch)
    }, [search, currentPage, totalPages]);
return (
        <div className="max-w-4xl lg:max-w-7xl mx-auto py-10 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Store</h1>
                {/* <p className="text-muted-foreground">Search for an item</p> */}
            </div>
            <Card className="bg-card border-border">
            {/* <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium uppercase text-foreground">
                Shop
                </CardTitle>

                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-foreground hover:text-foreground hover:bg-card"
                    >
                    <EllipsisVertical className="h-5 w-5" strokeWidth={2.5} />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52 bg-card border-border text-foreground">
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Shop Actions
                    </DropdownMenuLabel>
                </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader> */}

            <CardContent>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                {/* Order */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-muted-foreground">
                    Order By:
                    </span>

                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                        variant="outline"
                        className="h-7 px-2.5 text-xs uppercase text-foreground border-border hover:bg-background"
                        >
                        {ORDER_OPTIONS.find((opt) => opt.value === orderby)?.label ?? orderby}
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="start" className="w-40 bg-card border-border text-muted-foreground">
                        {ORDER_OPTIONS
                        .filter((opt) => opt.value !== orderby)
                        .map((opt) => (
                            <DropdownMenuItem
                            key={opt.value}
                            onClick={() => updateParams({ orderby: opt.value, direction: null })}
                            className="text-xs cursor-pointer focus:bg-card focus:text-foreground"
                            >
                            {opt.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateParams({ direction: direction === "asc" ? "desc" : "asc" })}
                    className="h-7 w-7 border-border text-muted-foreground hover:text-foreground hover:bg-background"
                    >
                    <ArrowUp
                        className={`h-3.5 w-3.5 transition-transform ${
                        direction === "desc" ? "rotate-180" : ""
                        }`}
                    />
                    </Button>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => updateParams({ search: e.target.value, page: 1 })}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") updateParams({ search: "" });
                    }}
                    className="h-8 border border-border text-foreground pr-9"
                    />

                    <button
                    onClick={() => updateParams({ search: "" })}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-all ${
                        search
                        ? "opacity-100 hover:bg-card text-muted-foreground hover:text-foreground"
                        : "opacity-0 pointer-events-none"
                    }`}
                    >
                    <X className="h-4 w-4" />
                    </button>
                </div>
                </div>
            </CardContent>
            </Card>
<div className="mx-auto px-6 py-12 space-y-10">
  {results.map((category) => (
    <section key={category.name} className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {category.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {category.products.map((product : any) => (
          <Card
            key={product.id}
            className="bg-card border-border relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-emerald-500/70 to-transparent" />

            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">
                {product.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {product.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-black text-foreground">
                  {formatMoney(product.pricePence / 100)}
                </p>

                {product.durationDays && (
                  <p className="text-xs uppercase text-muted-foreground">
                    {product.durationDays} days access
                  </p>
                )}
              </div>

              <div className="space-y-2 text-sm">
                {product.donatorLevel && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Donator Level</span>
                    <span className="font-medium text-foreground">
                      {product.donatorLevel}
                    </span>
                  </div>
                )}

                {product.durationDays && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium text-foreground">
                      {product.durationDays} days
                    </span>
                  </div>
                )}
              </div>

              <Button className="w-full">Purchase</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  ))}
</div>
            <div className="flex items-center px-2 py-4 border-t border-white/5">
                <div className="text-[10px] text-foreground uppercase font-bold tracking-widest">
                    Showing {totalRows === 0 ? 0 : offset + 1} to {Math.min(offset + itemPerPage, totalRows)} of {totalRows} People
                </div>
                
                <div className="flex gap-1">
                    <button 
                        disabled={currentPage <= 1}
                        onClick={() => updateParams({ page: currentPage - 1})}
                        className="p-2 border border-border hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center px-4 text-xs font-mono">
                        {currentPage > totalPages ? "1" : currentPage } / {totalPages}
                    </div>

                    <button 
                        disabled={currentPage >= totalPages}
                        onClick={() =>  updateParams({ page: currentPage + 1 })}
                        className="p-2 border border-border hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
            {/* <LoadingOverlay isVisible={isLoading} /> */}
        </div>
)};