import type { RegisterPayload, Tokens, User } from "../types";
import { api } from "./api";
import { tokenStore } from "./tokens";

export const authService = {
  async login(username: string, password: string) {
    const { data } = await api.post<Tokens>("auth/login/", { username, password });
    tokenStore.set(data);
    return data;
  },
  async register(payload: RegisterPayload) {
    const { data } = await api.post<Tokens & { user: User }>("auth/register/", payload);
    tokenStore.set(data);
    return data.user;
  },
  async me() {
    const { data } = await api.get<User>("auth/me/");
    return data;
  },
  async updateMe(payload: Partial<Pick<User, "first_name" | "last_name" | "email" | "phone" | "address">>) {
    const { data } = await api.patch<User>("auth/me/", payload);
    return data;
  },
  async changePassword(old_password: string, new_password: string) {
    await api.post("auth/change-password/", { old_password, new_password });
  },
  async logout() {
    const refresh = tokenStore.refresh;
    try {
      if (refresh) await api.post("auth/logout/", { refresh });
    } finally {
      tokenStore.clear();
    }
  },
};
