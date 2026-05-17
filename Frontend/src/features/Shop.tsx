import { useState, useEffect } from 'react'
import { toast } from "sonner"
import {Input } from "@/components/ui/input"
import {Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import { formatMoney, useQueryParams} from "@/lib/constants"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "@/lib/api"
import ProductManagementModel from "@/components/modals/ProductManagement"
// import LoadingOverlay from "@/components/modals/Loading"
import { ChevronLeft, ChevronRight, X, ArrowUp, ShoppingBasket, Trash2, Settings } from "lucide-react"
import { useAuth } from "@/lib/AuthContext"
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import type { BasketItem, ShopCategory, ShopProduct } from '@/types/modals'


export default function Shop() {
    const { user, perms } = useAuth();
    const navigate = useNavigate();
    const { searchParams, updateParams } = useQueryParams();
    const search = searchParams.get("search") ?? "";
    const orderby = searchParams.get("orderby") ?? "sortOrder";
    const direction = searchParams.get("direction") ?? "asc";
    const [searchInput, setSearchInput] = useState(search ?? "");
    const isManageProductsOpen = searchParams.get("manageProducts") === "true";
    // const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState<ShopProduct[]>([]);
    const [categories, setCategories] = useState<ShopCategory[]>([]);
    const currentPage = Number(searchParams.get("page") ?? 1);
    const [totalRows, setTotalRows] = useState(1);
    const itemPerPage = 12;
    const totalPages = Math.max(1, Math.ceil(totalRows / itemPerPage));
    const offset = Math.max(0, (itemPerPage * (currentPage - 1)));
    const [basket, setBasket] = useState<BasketItem[]>([]);

    const ORDER_OPTIONS = [
        { value: "name", label: "Name"},
        { value: "price", label: "Price"},
        { value: "duration", label: "Duration"},
        { value: "sortOrder", label: "Default" }
    ] as const;
    
    useEffect(() => {
      const timeout = setTimeout(() => {
          updateParams({ search: searchInput, page: 1 });
      }, 300);

      return () => clearTimeout(timeout);
    }, [searchInput]);

    const fetchProducts = async () => {
        try {
            // setIsLoading(true);
            const res = await apiFetch("GET", `/shop/products?search=${search}&orderby=${orderby}&direction=${direction}&offset=${offset}&limit=${itemPerPage}`);
            if (!res.ok) {
                setProducts([]);
                setCategories([]);
            };
            const data = await res.json();
            setProducts(data.products);
            const categories = data.categories.filter(
            (category : ShopCategory) => category.isActive)
            setCategories(categories);
            setTotalRows(data.totalProducts)
        } catch (error) {
            setProducts([]);
            setCategories([]);
            console.error("Fetch Error", error);
        }
    };

    const fetchBasket = () => {
      const basket = JSON.parse(localStorage.getItem("basket") ?? "[]");
      setBasket(basket);
    };

    const updateBasket = (type: "add" | "remove", item: BasketItem) => {
      setBasket(prev => {
        let next = [...prev];

        const existingIndex = next.findIndex(x => x.id === item.id);

        if (existingIndex !== -1) {
          if (type === "add") {
            next[existingIndex] = {
              ...next[existingIndex],
              quantity: next[existingIndex].quantity + 1
            };
          } else {
            const currentQty = next[existingIndex].quantity;

            if (currentQty <= 1) {
              next = next.filter(x => x.id !== item.id);
            } else {
              next[existingIndex] = {
                ...next[existingIndex],
                quantity: currentQty - 1
              };
            }
          }
        } else if (type === "add") {
          next.push({
            ...item,
            quantity: 1
          });
        }
        localStorage.setItem("basket", JSON.stringify(next));
        window.dispatchEvent(new Event("basketUpdated"));

        return next;
      });
      toast.success(`${item.name} ${type === "add" ? "added to" : "removed from"} basket`);
    };
    const resetBasket = () => {
        setBasket([]);
        localStorage.setItem("basket", "[]");
        window.dispatchEvent(new Event("basketUpdated"));
    };

    useEffect(() => {
        const delayedSearch = setTimeout(async () => {
            // setIsLoading(true);
            fetchProducts();
            fetchBasket();
        }, search.trim() ? 500 : 0);
        return () => clearTimeout(delayedSearch)
    }, [search, orderby, direction, currentPage, totalPages]);
return (
  <div className="max-w-6xl lg:max-w-7xl mx-auto px-4 md:px-6 py-12">
    <div className="bg-card border border-border rounded-2xl p-5 md:p-8 space-y-8 shadow-2xl shadow-black/20">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
            DecsPage Store
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Store
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Purchase memberships and in-game extras. Items are applied automatically after payment.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background/75 px-4 py-3 text-sm min-w-48">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Products
              </p>

              <p className="text-2xl font-black text-foreground">
                {totalRows}
              </p>
            </div>
            {(user?.adminlevel ?? 0) >= (perms?.admin?.SHOP_MANAGEMENT ?? 99) &&(
              <button
                className="text-muted-foreground hover:text-foreground transition-colors rounded-md p-1.5 cursor-pointer"
                onClick={() => {
                  updateParams({ manageProducts: "true" });
                }}>
              <Settings className="h-4.5 w-4.5" />
            </button>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card className="sticky top-20 z-20 bg-background/80 backdrop-blur border-border/50">
        <CardContent className="px-3 py-0">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Order
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-7 px-2.5 text-[11px] uppercase text-foreground border-border hover:bg-card cursor-pointer"
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
                        className="text-xs cursor-pointer focus:bg-background focus:text-foreground"
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
                className="h-8 w-8 border-border text-muted-foreground hover:text-foreground hover:bg-card cursor-pointer"
              >
                <ArrowUp
                  className={`h-3.5 w-3.5 transition-transform ${
                    direction === "desc" ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="relative h-7 px-2.5 text-[11px] uppercase text-foreground border-border hover:bg-card cursor-pointer"
                >
                  <ShoppingBasket className="h-4 w-4" />

                  {basket.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                      {basket.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-80 bg-card border-border text-foreground p-0"
              >
              <div className="flex items-center justify-between border-b border-border p-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">
                    Basket
                  </p>

                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {basket.length} item{basket.length === 1 ? "" : "s"}
                  </p>
                </div>

                <button
                  onClick={() => resetBasket()}
                  className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors rounded-md p-1.5 cursor-pointer"
                  title="Reset Basket"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
                {basket.length > 0 ? (
                  <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/15">
                    {basket.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-3 border-b border-border last:border-b-0"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            Qty {item.quantity}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <p className="text-sm font-black text-foreground">
                            {formatMoney((item.pricePence * item.quantity) / 100)}
                          </p>
                          <button
                            onClick={() => updateBasket("remove", item)}
                            className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors rounded-md cursor-pointer"
                            title="Remove Item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-sm text-muted-foreground">
                    Basket is empty.
                  </div>
                )}

                <div className="p-3 border-t border-border space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-black text-foreground">
                      {formatMoney(
                        basket.reduce(
                          (sum, item) => sum + item.pricePence * item.quantity,
                          0
                        ) / 100
                      )}
                    </span>
                  </div>

                  <Button
                    disabled={basket.length === 0}
                    onClick={() => navigate(`/checkout`)}
                    className="w-full h-8 text-xs uppercase bg-emerald-500 text-white"
                  >
                    Checkout
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="relative w-full md:w-72 bg-card rounded-xl">
              <Input
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchInput("");
                }}
                className="h-7 text-xs bg-card border border-border text-foreground pr-9"
              />

              <button
                onClick={() => setSearchInput("")}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-all ${
                  searchInput
                    ? "opacity-100 hover:bg-background text-muted-foreground hover:text-foreground"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="space-y-10">
        {categories.map((category) => {
          const categoryProducts = products.filter(
            (product) => product.categoryId === category.nameId
            && product.isActive);
            if (categoryProducts.length == 0) return null;
          return (
          <section key={category.name} className="space-y-4">
            {category.nameId !== "none" && (
              <div className="flex items-end justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
                    {category.name}
                  </h2>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                    {categoryProducts.length} product{categoryProducts.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {categoryProducts.map((product: any) => {
                const isPopular = product.id === "sixMonths";

                return (
                  <Card
                    key={product.id}
                    className="group bg-background/75 border-border relative overflow-hidden transition-all hover:-translate-y-0.5 hover:border-emerald-500/40"
                  >
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-emerald-500/80 to-transparent" />

                    {isPopular && (
                      <div className="absolute right-3 top-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                        Best Value
                      </div>
                    )}

                    <CardHeader className="pb-4">
                      <CardTitle className="pr-24 text-sm font-black uppercase tracking-widest text-foreground">
                        {product.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground min-h-8">
                        {product.description}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-5">
                      <div>
                        <p className="text-4xl font-black tracking-tight text-foreground">
                          {formatMoney(product.pricePence / 100)}
                        </p>

                        {product.durationDays ? (
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {product.durationDays} days access
                          </p>
                        ) : (
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            One Time Use
                          </p>
                        )}
                      </div>

                      <div className="rounded-lg border border-border bg-card/60 p-3 space-y-2 text-sm">
                      {product.paramsJson.map((param : any) => {

                        return(
                          <div>
                          {param.showOnStore && (
                            <div key={param.key} className="flex justify-between">
                              <span className="text-muted-foreground">{param.label}</span>
                              <span className="font-bold text-foreground">{param.value}</span>
                            </div>
                          )}
                          </div>
                        )
                      })}
                        {product.fulfilmentMode && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Delivery</span>
                            <span className="font-bold text-foreground">{product.fulfilmentMode}</span>
                          </div>
                        )}
                      </div>

                      {user === null ? (
                        <Button
                          onClick={() => updateParams({ login: "true" })}
                          className="w-full cursor-pointer bg-card text-foreground border border-border hover:bg-background"
                        >
                          Log In to Purchase
                        </Button>
                      ) : (
                        <Button
                          // onClick={() => navigate(`/checkout?product=${product.id}`)}
                          onClick={() => updateBasket("add", product)}
                          className="w-full cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Add To Basket
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )})}
      </div> 

      {/* Footer / Pagination */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-1 py-4 border-t border-border">
        <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
          Showing {totalRows === 0 ? 0 : offset + 1} to{" "}
          {Math.min(offset + itemPerPage, totalRows)} of {totalRows} products
        </div>

        <div className="flex items-center gap-1">
          <button
            disabled={currentPage <= 1}
            onClick={() => updateParams({ page: currentPage - 1 })}
            className="p-2 border border-border hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-md"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center px-4 text-xs font-mono text-foreground">
            {currentPage > totalPages ? "1" : currentPage} / {totalPages}
          </div>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => updateParams({ page: currentPage + 1 })}
            className="p-2 border border-border hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-md"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
    <ProductManagementModel open={isManageProductsOpen} setOpen={(value) => updateParams({ manageProducts: value ? "true" : null })} onSuccess={() => fetchProducts()}/>
  </div>
)};