import { createContext } from "react";

import type { Cart, RegisterPayload, User } from "../types";

export interface AuthState {
  user: User | null;
  ready: boolean; // sahifa ochilganda token tekshiruvi tugadimi
  login: (username: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export interface CartState {
  cart: Cart | null;
  loading: boolean;
  busyItem: number | null; // qaysi element hozir o'zgartirilmoqda
  count: number;
  refresh: () => Promise<void>;
  add: (productId: number, quantity?: number) => Promise<void>;
  update: (itemId: number, quantity: number) => Promise<void>;
  remove: (itemId: number) => Promise<void>;
  clear: () => Promise<void>;
  reset: () => void;
}

export type ToastKind = "success" | "error" | "info";
export interface ToastState {
  notify: (message: string, kind?: ToastKind) => void;
}

export const AuthContext = createContext<AuthState | null>(null);
export const CartContext = createContext<CartState | null>(null);
export const ToastContext = createContext<ToastState | null>(null);
