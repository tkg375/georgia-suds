"use client";
import { createContext, useContext, useReducer, useEffect, useState } from "react";
import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "tgb-cart";

type CartAction =
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; productId: string }
  | { type: "UPDATE_QTY"; productId: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "HYDRATE":
      return action.items;
    case "ADD": {
      const existing = state.find((i) => i.productId === action.item.productId);
      if (existing) {
        return state.map((i) =>
          i.productId === action.item.productId
            ? { ...i, quantity: i.quantity + action.item.quantity }
            : i
        );
      }
      return [...state, action.item];
    }
    case "REMOVE":
      return state.filter((i) => i.productId !== action.productId);
    case "UPDATE_QTY":
      if (action.quantity <= 0) return state.filter((i) => i.productId !== action.productId);
      return state.map((i) =>
        i.productId === action.productId ? { ...i, quantity: action.quantity } : i
      );
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  totalCents: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  hydrated: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) dispatch({ type: "HYDRATE", items: JSON.parse(stored) });
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage on every change (after hydration)
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalCents = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalCents,
        hydrated,
        addItem: (item) => dispatch({ type: "ADD", item }),
        removeItem: (productId) => dispatch({ type: "REMOVE", productId }),
        updateQuantity: (productId, quantity) =>
          dispatch({ type: "UPDATE_QTY", productId, quantity }),
        clearCart: () => dispatch({ type: "CLEAR" }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
