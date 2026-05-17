import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogOverlay } from '@/components/ui/dialog'
// import { useAuth } from "@/lib/AuthContext"
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"
import { apiFetch } from "@/lib/api"
import { formatMoney, useQueryParams } from "@/lib/constants"
import { ChevronDown, Plus, X } from "lucide-react"
// import LoadingOverlay from "@/components/modals/Loading"
import type { EditableShopProduct, ShopCategory } from '@/types/modals'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function ProductManagementModel({open, setOpen, onSuccess}: {open: boolean; setOpen: (val: boolean) => void; onSuccess: any}) {
    const { searchParams } = useQueryParams();
    // const isViewWhitelistOpen = searchParams.get("whitelist") !== null;
    // const [isLoading, setIsLoading] = useState(false);
    // const { user, perms } = useAuth();
    const search = searchParams.get("search") ?? "";
    const orderby = searchParams.get("orderby") ?? "price";
    const direction = searchParams.get("direction") ?? "asc";
    // const [searchInput, setSearchInput] = useState(search ?? ""); 
    const [products, setProducts] = useState<EditableShopProduct []>([]);
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const [managerTab, setManagerTab] = useState("products");
    const [categories, setCategories] = useState<any[]>([]);
    const currentPage = Number(searchParams.get("page") ?? 1);
    const [totalRows, setTotalRows] = useState(1);
    const itemPerPage = 12;
    const offset = Math.max(0, (itemPerPage * (currentPage - 1)));
    const totalPages = Math.max(1, Math.ceil(totalRows / itemPerPage));

    const updateDraft = (
        productId: number,
        updates: Partial<EditableShopProduct>
        ) => {
        setProducts(prev =>
            prev.map(product =>
            product.id === productId
                ? { ...product, ...updates }
                : product
            )
        );
    };

    const addDraftProduct = () => {
        const newProduct: EditableShopProduct = {
            id: 0,
            nameId: "",
            categoryId: "None",
            name: "",
            description: "",
            pricePence: 0,
            currency: "gbp",
            fulfilmentMode: "Manual",
            isActive: true,
            sortingOrder: 0,
            paramsJson: []
        };

        setProducts(prev => [newProduct, ...prev]);
        setEditingProductId(0);
    };

    // const deleteProduct = async (productId: number) => {
    //     setProducts(prev =>
    //         prev.filter(product => product.id !== productId)
    //     );

    //     if (editingProductId === productId) {
    //         setEditingProductId(null);
    //     }

    //     var res = await apiFetch("POST", "/shop/toggleActive&id=" + productId);
    //     var data = await res.json();
    //     if (!res.ok) {
    //         toast.error(data.message ?? "Failed to change active status");
    //         return;
    //     }
    //     toast.success("Product is now " + (data.isActive === "True" ? "Active" : "Inactive"));
    // };

    const addProductParam = (productId: number) => {
    setProducts(prev =>
        prev.map(product => {
        if (product.id !== productId) return product;

        const currentParams = Array.isArray(product.paramsJson)
            ? product.paramsJson
            : [];

        return {
            ...product,
            paramsJson: [
            ...currentParams,
            {
                key: "",
                label: "",
                value: "",
                type: "text",
                showOnStore: true,
            },
            ],
        };
        })
    );
    };
    
    const updateProductParam = (
        productId: number,
        index: number,
        updates: Partial<Record<string, any>>
        ) => {
        setProducts(prev =>
            prev.map(product => {
            if (product.id !== productId) return product;

            const updatedParams = [... Array.isArray(product.paramsJson) ? product.paramsJson : []];

            updatedParams[index] = {
                ...(updatedParams[index] ?? {}),
                ...updates,
            };

            return {
                ...product,
                paramsJson: updatedParams,
            };
            })
        );
    };

    const removeProductParam = (
        productId: number,
        index: number
        ) => {
        setProducts(prev =>
            prev.map(product => {
            if (product.id !== productId) return product;

            return {
                ...product,
                paramsJson: (product.paramsJson ?? []).filter(
                (_ : any, i : number) => i !== index
                )
            };
            })
        );
    };

    const resetProductDraft = async () => {
        await fetchProducts();
    };

    const saveProduct = async (product: EditableShopProduct) => {
        try {
            // setIsLoading(true);

            var res = await apiFetch("POST", `/shop/Product/${product.id}/update`, {
                body: JSON.stringify(product)
            });
            var data = await res.json();
            if (product.id === 0) {
                toast.success("Product created " + data.name);
            } else {
                toast.success("Successfully updated " + data.name);
            };

            await fetchProducts();

            setEditingProductId(null);
        } catch (err) {
            console.error(err);
        } finally {
            // setIsLoading(false);
        }
    };

    const addDraftCategory = () => {
        const newCategory: ShopCategory = {
            id: 0,
            nameId: "",
            name: "",
            description: "",
            sortingOrder: 0,
            isActive: true,
            createdAt: new Date().toISOString(),
        };

        setCategories(prev => [newCategory, ...prev]);
        setEditingCategoryId(0);
    };

    const updateCategoryDraft = (
        categoryId: number,
        updates: Partial<ShopCategory>
        ) => {
        setCategories(prev =>
            prev.map(category =>
            category.id === categoryId
                ? { ...category, ...updates }
                : category
            )
        );
    };

    const saveCategory = async (category: ShopCategory) => {
        try {
            // setIsLoading(true);
            console.log(category);
            var res = await apiFetch("POST", `/shop/category/${category.id}/update`, {
                body: JSON.stringify(category)
            });
            var data = await res.json();
            if (category.id === 0) {
                toast.success("Category created " + data.name);
            } else {
                toast.success("Successfully updated " + data.name);
            };

            await fetchProducts();

            setEditingCategoryId(null);
        } catch (err) {
            console.error(err);
        } finally {
            // setIsLoading(false);
        }
    };

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
            setCategories(data.categories);
            setTotalRows(data.totalProducts)
        } catch (error) {
            setProducts([]);
            setCategories([]);
            console.error("Fetch Error", error);
        }
    };

    useEffect(() => {
        const delayedSearch = setTimeout(async () => {
            // setIsLoading(true);
            fetchProducts();
        }, search.trim() ? 500 : 0);
        return () => clearTimeout(delayedSearch)
    }, [search, orderby, direction, currentPage, totalPages]);

    return (
        <Dialog open={open} onOpenChange={(open) => {
            setOpen(open);
            if (!open) {
                onSuccess();
            }
        }}>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/75" />
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/15 bg-card border-border text-foreground">
            <Tabs value={managerTab} className="w-full" onValueChange={setManagerTab}>
            <DialogHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4 pr-8">
                <div>
                <DialogTitle className="text-2xl font-black tracking-tight">
                    Product Management
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                    Manage store products, pricing, fulfilment behaviour and display metadata.
                </DialogDescription>
                </div>

                {managerTab === "products" && (
                    <Button
                    onClick={addDraftProduct}
                    className="h-8 bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                    >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                    </Button>
                )}
                {managerTab === "categories" && (
                    <Button
                    onClick={addDraftCategory}
                    className="h-8 bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                    >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                    </Button>
                )}
            </div>

            
            <TabsList className="grid w-full grid-cols-2 bg-background border border-white/5 h-10 p-1">
                <TabsTrigger 
                value="products" 
                className="text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-card!"
                >
                Products
                </TabsTrigger>
                <TabsTrigger 
                value="categories" 
                className="text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-card!"
                >
                Categories
                </TabsTrigger>
            </TabsList>
            </DialogHeader>
            <TabsContent value={managerTab} className="mt-4 min-h-18.75"> 
            {managerTab === "products" && (
            <div className="space-y-3">
            {products.map((product) => {
                const isEditing = editingProductId === product.id;
                const categoryName = categories.find(c => c.nameId === product.categoryId)?.name ?? "None";
                return (
                <div
                    key={product.id}
                    className="rounded-xl border border-border bg-background/75 overflow-hidden"
                >
                    {/* Compact Row */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-black text-foreground truncate">
                            {product.name || "New Product"}
                        </p>

                        <Badge variant="outline" className="text-[10px] uppercase">
                            {categoryName}
                        </Badge>

                        <Badge
                            variant="outline"
                            className={`text-[10px] uppercase ${
                            product.fulfilmentMode === "Auto"
                                ? "border-emerald-500 text-emerald-500 bg-emerald-500/5"
                                : product.fulfilmentMode === "Manual"
                                ? "border-amber-500 text-amber-500 bg-amber-500/5"
                                : "border-border text-muted-foreground"
                            }`}
                        >
                            {product.fulfilmentMode || "Manual"}
                        </Badge>

                        {!product.isActive && (
                            <Badge variant="outline" className="text-[10px] border-red-500 text-red-500 bg-red-500/5">
                            Hidden
                            </Badge>
                        )}
                        </div>

                        <p className="text-xs text-muted-foreground truncate mt-1">
                        {product.description || "No description set."}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                        <p className="text-lg font-black">
                            {formatMoney(Number(product.pricePence) / 100)}
                        </p>
                        {/* <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            Sort {product.sortingOrder ?? 0}
                        </p> */}
                        </div>

                        <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setEditingProductId(isEditing ? null : product.id)
                        }
                        className='cursor-pointer'
                        >
                        {isEditing ? "Close" : "Edit"}
                        </Button>

                        {/* <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteProduct(product.id)}
                        className="text-muted-foreground hover:text-red-500"
                        >
                        <Trash2 className="h-4 w-4" />
                        </Button> */}
                    </div>
                    </div>

                    {/* Expanded Editor */}
                    {isEditing && (
                    <div className="border-t border-border p-4 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Name ID">
                            <div className="bg-card border-border">
                            <Input
                            value={product.nameId}
                            onChange={(e) => {updateDraft(product.id, { nameId: e.target.value }); }}
                            className="bg-card border-border"
                            />
                            </div>
                        </Field>

                        <Field label="Category">
                            <div className="relative w-full">
                            <select
                            value={product.categoryId}
                            onChange={(e) => updateDraft(product.id, { categoryId: e.target.value })}
                            className="h-9 rounded-md bg-card border border-border text-sm px-2 text-foreground w-full appearance-none"
                            >
                            {categories.map((category) => (
                                <option key={category.id} value={category.nameId}>
                                {category.name}
                                </option>
                            ))}
                            </select>
                            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-foreground">
                                <ChevronDown className="h-4 w-4" />
                            </div>
                            </div>
                        </Field>

                        <Field label="Name">
                            <div className="bg-card border-border">
                            <Input
                            value={product.name}
                            onChange={(e) => updateDraft(product.id, { name: e.target.value })}
                            className="bg-card border-border"
                            />
                            </div>
                        </Field>

                        <Field label="Price Pence">
                            <div className="bg-card border-border">
                            <Input
                            type="number"
                            value={product.pricePence}
                            onChange={(e) =>
                                updateDraft(product.id, { pricePence: Number(e.target.value) })
                            }
                            className="bg-card border-border"
                            />
                            </div>
                        </Field>

                        <Field label="Currency">
                            <div className="bg-card border-border">
                            <Input
                            value={product.currency}
                            onChange={(e) => updateDraft(product.id, { currency: e.target.value })}
                            className="bg-card border-border"
                            />
                            </div>
                        </Field>

                        <Field label="Fulfilment Mode">
                            <div className="relative w-full">
                            <select
                            value={product.fulfilmentMode}
                            onChange={(e) =>
                                updateDraft(product.id, { fulfilmentMode: e.target.value })
                            }
                            className="h-9 rounded-md bg-card border border-border text-sm px-2 text-foreground w-full appearance-none"
                            >
                            <option value="Auto">Auto</option>
                            <option value="Manual">Manual</option>
                            <option value="None">None</option>
                            </select>
                            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-foreground">
                                <ChevronDown className="h-4 w-4" />
                            </div>
                            </div>
                        </Field>

                        <Field label="Sort Order">
                            <div className="bg-card border-border">
                            <Input
                            type="number"
                            value={product.sortingOrder ?? 0}
                            onChange={(e) =>
                                updateDraft(product.id, { sortingOrder: Number(e.target.value) })
                            }
                            className="bg-card border-border"
                            />
                            </div>
                        </Field>

                        <Field label="Active">
                            <div className="bg-card border-border">
                            <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                updateDraft(product.id, { isActive: !product.isActive })
                            }
                            className={
                                product.isActive
                                ? "border-emerald-500 text-emerald-500 bg-emerald-500/5 w-full cursor-pointer"
                                : "border-red-500 text-red-500 bg-red-500/5 w-full cursor-pointer"
                            }
                            >
                            {product.isActive ? "Active" : "Hidden"}
                            </Button>
                            </div>
                        </Field>
                        </div>

                        <Field label="Description">
                        <div className="bg-card border-border min-h-20">
                        <Textarea
                            value={product.description}
                            onChange={(e: any) =>
                            updateDraft(product.id, { description: e.target.value })
                            }
                            className="bg-card border-border min-h-20"
                        />
                        </div>
                        </Field>

                        {/* Params */}
                        <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3 mt-5">
                        <div className="flex items-center justify-between">
                            <div>
                            <p className="text-xs font-black uppercase tracking-widest">
                                Product Parameters
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                Used for store display and fulfilment processing
                            </p>
                            </div>

                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addProductParam(product.id)}
                            className='cursor-pointer'>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Field
                            </Button>
                        </div>

                        {(product.paramsJson ?? []).map((param : any, index : number) => (
                            <div
                            key={`${product.id}-param-${index}`}
                            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 items-center border-t border-border pt-3 first:border-t-0 first:pt-0"
                            >
                            <Input
                                placeholder="key"
                                value={param.key}
                                onChange={(e) =>
                                updateProductParam(product.id, index, { key: e.target.value })
                                }
                                className="bg-background border-border"
                            />

                            <Input
                                placeholder="label"
                                value={param.label}
                                onChange={(e) =>
                                updateProductParam(product.id, index, { label: e.target.value })
                                }
                                className="bg-background border-border"
                            />

                            <Input
                                placeholder="value"
                                value={param.value}
                                onChange={(e) =>
                                updateProductParam(product.id, index, { value: e.target.value })
                                }
                                className="bg-background border-border"
                            />

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                updateProductParam(product.id, index, {
                                    showOnStore: !param.showOnStore,
                                })
                                }
                                className={
                                param.showOnStore
                                    ? "border-blue-500 text-blue-400 cursor-pointer"
                                    : "border-border text-muted-foreground cursor-pointer"
                                }
                            >
                                {param.showOnStore ? "Visible" : "Hidden"}
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeProductParam(product.id, index)}
                                className="text-muted-foreground hover:text-red-500 cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            </div>
                        ))}
                        </div>

                        <div className="flex justify-end gap-2 border-t border-border pt-4">
                        <Button
                            variant="outline"
                            onClick={() => resetProductDraft()}
                            className="cursor-pointer"
                        >
                            Reset
                        </Button>

                        <Button
                            onClick={() => saveProduct(product)}
                            className="bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                        >
                            Save Product
                        </Button>
                        </div>
                    </div>
                    )}
                </div>
                );
            })}
            </div>
            )}

            {managerTab === "categories" && (
            <div className="space-y-3">
            {categories.map((category) => {
                const isEditing = editingCategoryId === category.id;
                if (category.nameId === "none") return null;
                return (
                <div
                    key={category.id}
                    className="rounded-xl border border-border bg-background/75 overflow-hidden"
                >
                    {/* Compact Row */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-black text-foreground truncate">
                            {category.name || "New category"}
                        </p>

                        {!category.isActive && (
                            <Badge variant="outline" className="text-[10px] border-red-500 text-red-500 bg-red-500/5">
                            Hidden
                            </Badge>
                        )}
                        </div>

                        <p className="text-xs text-muted-foreground truncate mt-1">
                        {category.description || "No description set."}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setEditingCategoryId(isEditing ? null : category.id)
                        }
                        className='cursor-pointer'
                        >
                        {isEditing ? "Close" : "Edit"}
                        </Button>

                        {/* <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deletecategory(category.id)}
                        className="text-muted-foreground hover:text-red-500"
                        >
                        <Trash2 className="h-4 w-4" />
                        </Button> */}
                    </div>
                    </div>

                    {/* Expanded Editor */}
                    {isEditing && (
                    <div className="border-t border-border p-4 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Name ID">
                            <div className="bg-card border-border">
                            <Input
                            value={category.nameId}
                            onChange={(e) => {updateCategoryDraft(category.id, { nameId: e.target.value }); }}
                            className="bg-card border-border"
                            />
                            </div>
                        </Field>

                        <Field label="Name">
                            <div className="bg-card border-border">
                            <Input
                            value={category.name}
                            onChange={(e) => updateCategoryDraft(category.id, { name: e.target.value })}
                            className="bg-card border-border"
                            />
                            </div>
                        </Field>

                        <Field label="Sort Order">
                            <div className="bg-card border-border">
                            <Input
                            type="number"
                            value={category.sortingOrder ?? 0}
                            onChange={(e) =>
                                updateCategoryDraft(category.id, { sortingOrder: Number(e.target.value) })
                            }
                            className="bg-card border-border"
                            />
                            </div>
                        </Field>

                        <Field label="Active">
                            <div className="bg-card border-border">
                            <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                updateCategoryDraft(category.id, { isActive: !category.isActive })
                            }
                            className={
                                category.isActive
                                ? "border-emerald-500 text-emerald-500 bg-emerald-500/5 w-full cursor-pointer"
                                : "border-red-500 text-red-500 bg-red-500/5 w-full cursor-pointer"
                            }
                            >
                            {category.isActive ? "Active" : "Hidden"}
                            </Button>
                            </div>
                        </Field>
                        </div>

                        <Field label="Description">
                        <div className="bg-card border-border min-h-20">
                        <Textarea
                            value={category.description}
                            onChange={(e: any) =>
                            updateCategoryDraft(category.id, { description: e.target.value })
                            }
                            className="bg-card border-border min-h-20"
                        />
                        </div>
                        </Field>

                        <div className="flex justify-end gap-2 border-t border-border pt-4">
                        <Button
                            variant="outline"
                            // onClick={() => resetCategoryDraft()}
                            className="cursor-pointer"
                        >
                            Reset
                        </Button>

                        <Button
                            onClick={() => saveCategory(category)}
                            className="bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                        >
                            Save Category
                        </Button>
                        </div>
                    </div>
                    )}
                </div>
                );
            })}
            </div>
            )}

        </TabsContent>
        </Tabs>
        </DialogContent>
        </Dialog>

    );
};