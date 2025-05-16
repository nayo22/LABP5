import { AppDispatcher, Action } from "./Dispatcher";
import {
  CounterActionTypes,
  UserActionTypes,
  ProductActionTypes,
  CartActionTypes,
} from "./Actions";
import { Product, CartItem } from "../types/ProductTypes";

export type User = {
  name: string;
  age: number;
};

export type State = {
  count: number;
  user: User | null;
  products: Product[];
  isLoading: boolean;
  error: string | null;
  cart: CartItem[];
};

type Listener = (state: State) => void;

const CART_STORAGE_KEY = "ecommerce_cart";

class Store {
  private _state: State = {
    count: 0,
    user: null,
    products: [],
    isLoading: false,
    error: null,
    cart: [],
  };

  private _listeners: Listener[] = [];

  constructor() {
    AppDispatcher.register(this._handleActions.bind(this));
    this._loadCartFromStorage();
  }

  getState(): State {
    return this._state;
  }

  subscribe(listener: Listener): void {
    this._listeners.push(listener);
    listener(this._state);
  }

  unsubscribe(listener: Listener): void {
    this._listeners = this._listeners.filter((l) => l !== listener);
  }

  private _emitChange(): void {
    for (const listener of this._listeners) {
      listener(this._state);
    }
  }

  private _handleActions(action: Action): void {
    let updated = false;

    switch (action.type) {

      case CounterActionTypes.INCREMENT_COUNT:
        if (typeof action.payload === "number") {
          this._state.count += action.payload;
          updated = true;
        }
        break;

      case CounterActionTypes.DECREMENT_COUNT:
        if (typeof action.payload === "number") {
          this._state.count -= action.payload;
          updated = true;
        }
        break;


      case UserActionTypes.SAVE_USER:
        if (typeof action.payload === "object" && action.payload !== null) {
          this._state.user = action.payload as User;
          updated = true;
        }
        break;


      case ProductActionTypes.LOAD_PRODUCTS:
        if (Array.isArray(action.payload)) {
          this._state.products = action.payload as Product[];
          updated = true;
        }
        break;

      case ProductActionTypes.SET_LOADING:
        if (typeof action.payload === "boolean") {
          this._state.isLoading = action.payload;
          updated = true;
        }
        break;

      case ProductActionTypes.SET_ERROR:
        this._state.error = action.payload as string | null;
        updated = true;
        break;


      case CartActionTypes.ADD_TO_CART:
        if (
          action.payload &&
          typeof action.payload === "object" &&
           "product" in action.payload &&
           "quantity" in action.payload
      ) {
        const typedPayload = action.payload as { product: Product; quantity: number };
          this._addToCart(typedPayload);
          this._saveCartToStorage();
    updated = true;
      }
       break;

      case CartActionTypes.REMOVE_FROM_CART:
        if (typeof action.payload === "number") {
          this._state.cart = this._state.cart.filter(item => item.id !== action.payload);
          this._saveCartToStorage();
          updated = true;
        }
        break;

      case CartActionTypes.UPDATE_QUANTITY:
        if (action.payload && typeof action.payload === "object") {
          const { productId, quantity } = action.payload as {
            productId: number;
            quantity: number;
          };
          this._state.cart = this._state.cart.map(item =>
            item.id === productId ? { ...item, quantity } : item
          );
          this._saveCartToStorage();
          updated = true;
        }
        break;

      case CartActionTypes.CLEAR_CART:
        this._state.cart = [];
        this._saveCartToStorage();
        updated = true;
        break;
    }

    if (updated) this._emitChange();
  }

  private _addToCart(payload: { product: Product; quantity: number }): void {
  const { product, quantity } = payload;
  const existing = this._state.cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      const newItem: CartItem = { ...product, quantity };
      this._state.cart.push(newItem);
    }
  }

  private _saveCartToStorage(): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this._state.cart));
  }

  private _loadCartFromStorage(): void {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    if (!data) return;

    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        this._state.cart = parsed;
      }
    } catch (e) {
      console.error("Error al cargar carrito:", e);
    }
  }
}

export const store = new Store();
