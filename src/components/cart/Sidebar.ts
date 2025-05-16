// src/components/cart/Sidebar.ts
import { store, State } from '../../flux/Store';
import { CartActions } from '../../flux/Actions';
import { CartItem } from '../../types/ProductTypes';
import './Checkout';

class Sidebar extends HTMLElement {
	private state: State = store.getState();
	private isCheckoutOpen = false;

	static get observedAttributes() {
		return ['open'];
	}


	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		store.subscribe(this.handleStateChange.bind(this));
		this.render();
	}

	disconnectedCallback() {
		store.unsubscribe(this.handleStateChange.bind(this));
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if (name === 'open' && this.isConnected && oldValue !== newValue) {
			this.render();
		}
	}

	private handleStateChange(state: State) {
		this.state = state;
		this.render();
	}

	private isOpen(): boolean {
		return this.hasAttribute('open');
	}

	private getCartTotal(): number {
		return this.state.cart.reduce((total, item) => total + item.price * item.quantity, 0);
	}

	private handleClose = () => {
		this.removeAttribute('open');
	};

	private handleQuantityChange = (id: number, action: string) => {
		const item = this.state.cart.find((i) => i.id === id);
		if (!item) return;

		if (action === 'decrease' && item.quantity === 1) {
			CartActions.removeFromCart(id);
		} else {
			CartActions.updateQuantity(id, action === 'increase' ? item.quantity + 1 : item.quantity - 1);
		}
	};

	private handleRemoveItem = (id: number) => {
		CartActions.removeFromCart(id);
	};

	private handleCheckout = () => {
		this.isCheckoutOpen = true;
		this.render();
	};

	private handleCheckoutClose = () => {
		this.isCheckoutOpen = false;
		this.render();
	};

	private addEventListeners() {
		const overlay = this.shadowRoot?.querySelector('.overlay');
		const closeBtn = this.shadowRoot?.querySelector('.sidebar-header button');

		overlay?.addEventListener('click', this.handleClose);
		closeBtn?.addEventListener('click', this.handleClose);

		const checkoutBtn = this.shadowRoot?.querySelector('.checkout-btn');
		checkoutBtn?.addEventListener('click', this.handleCheckout);

		const clearBtn = this.shadowRoot?.querySelector('.clear-cart-btn');
		clearBtn?.addEventListener('click', () => CartActions.clearCart());
	}

	private getStyles() {
		return `
    :host {
      display: block;
    }

    .overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(0, 0, 0, 0.3);
      z-index: 90;
    }

    .sidebar {
      position: fixed;
      top: 0;
      right: 0;
      width: 360px;
      max-width: 100vw;
      height: 100vh;
      background-color: var(--surface);
      box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
      transform: translateX(${this.isOpen() ? '0' : '100%'});
      transition: transform 0.3s ease;
      z-index: 100;
      display: flex;
      flex-direction: column;
      border-top-left-radius: var(--radius);
      border-bottom-left-radius: var(--radius);
    }

    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
      font-size: 1.2rem;
      color: var(--text);
    }

    .cart-items {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
    }

  .cart-item {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      align-items: flex-start;
    }

    .item-image {
      width: 64px;
      height: 64px;
      object-fit: contain;
      border-radius: var(--radius);
      border: 1px solid #eee;
      padding: 4px;
    }

    .item-details {
      flex: 1;
      font-size: 0.9rem;
      color: var(--text);
      gap: 0.25rem;
    }

    .item-title {
      font-weight: 600;
      margin: 0 0 0.2rem;
      line-height: 1.2; /* más compacto */
    }

    .item-price {
      color: var(--secondary);
      font-weight: bold;
      margin: 0; /* elimina margen innecesario */
      font-size: 0.95rem;
    }

    .quantity-control {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0.5rem 0;
    }

    .quantity-btn {
      width: 24px;
      height: 24px;
      background: var(--primary);
      border: none;
      border-radius: var(--radius);
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      color: var(--text);
    }

    .remove-btn {
      background: none;
      border: none;
      color: var(--danger);
      cursor: pointer;
      display: flex;
      justify-content: flex-end;
      padding: 0;
      margin-top: 0.5rem;
    }

    .trash-icon {
      width: 18px;
      height: 18px;
      pointer-events: none;
    }
    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid #eee;
      background-color: var(--background); /* Usa el color de fondo global */
    }


    .cart-total {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }

    .btn {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: var(--radius);
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }

    .checkout-btn {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
    }

    .clear-cart-btn {
      background:rgb(102, 102, 102);
      color: var(--text);
    }

    .empty-cart {
      text-align: center;
      padding: 2rem;
      color: var(--text-muted);
    }
  `;
	}

	render() {
		if (!this.shadowRoot) return;

		const items = this.state.cart;
		const total = this.getCartTotal();

		this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      ${this.isOpen() ? `<div class="overlay"></div>` : ''}
      <aside class="sidebar">
        <div class="sidebar-header">
          <h3>Tu carrito</h3>
          <button>✕</button>
        </div>

        <div class="cart-items">
          ${
						items.length === 0
							? `<div class="empty-cart">Tu carrito está vacío</div>`
							: items.map((item) => this.renderCartItem(item)).join('')
					}
        </div>

        <div class="sidebar-footer">
          <div class="cart-total">
            <span>Total:</span>
            <span>$${total.toFixed(2)}</span>
          </div>
          <button class="btn checkout-btn" ${items.length === 0 ? 'disabled' : ''}>Finalizar compra</button>
          <button class="btn clear-cart-btn" ${items.length === 0 ? 'disabled' : ''}>Vaciar carrito</button>
        </div>
      </aside>
      ${this.isCheckoutOpen ? `<checkout-form></checkout-form>` : ''}
    `;

		this.addEventListeners();
	}

	private renderCartItem(item: CartItem): string {
		return `
      <div class="cart-item">
        <img class="item-image" src="${item.image}" alt="${item.title}">
        <div class="item-details">
          <p class="item-title">${item.title}</p>
          <p class="item-price">$${item.price.toFixed(2)}</p>
          <div class="quantity-control">
            <button class="quantity-btn" onclick="this.getRootNode().host.handleQuantityChange(${
							item.id
						}, 'decrease')">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn" onclick="this.getRootNode().host.handleQuantityChange(${
							item.id
						}, 'increase')">+</button>
          </div>
          <button class="remove-btn" onclick="this.getRootNode().host.handleRemoveItem(${item.id})" title="Eliminar">
            <svg class="trash-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6h18v2H3V6zm2 3h14v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9zm5 2v9h2v-9H10zm4 0v9h2v-9h-2zM9 4V2h6v2h5v2H4V4h5z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
	}
}

customElements.define('cart-sidebar', Sidebar);
