import { store, State } from '../../flux/Store';

class Cart extends HTMLElement {
	private state: State = store.getState();

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		store.subscribe(this.handleStateChange.bind(this));
		this.render();
		this.addEventListeners();
	}

	disconnectedCallback() {
		store.unsubscribe(this.handleStateChange.bind(this));
	}

	private handleStateChange(state: State) {
		this.state = state;
		this.render();
	}

	private getCartItemsCount(): number {
		return this.state.cart.reduce((total, item) => total + item.quantity, 0);
	}

	private addEventListeners() {
		const button = this.shadowRoot?.querySelector('.cart-button');
		button?.addEventListener('click', () => {
			this.dispatchEvent(
				new CustomEvent('toggle-cart', {
					bubbles: true,
					composed: true,
				})
			);
		});
	}

	private getStyles() {
		return `
      :host {
        display: inline-block;
        position: relative;
      }

      .cart-button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        font-size: 1.5rem;
        color: var(--primary-color, #4c7cff);
        transition: color 0.2s ease;
      }

      .cart-button:hover {
        color: var(--primary-color-dark, #3a5dbe);
      }

      .cart-icon {
        width: 2rem;
        height: 2rem;
      }

      .cart-badge {
        position: absolute;
        top: -0.2rem;
        right: -0.2rem;
        background: var(--accent-color, #ff6b6b);
        color: #fff;
        border-radius: 50%;
        width: 1.2rem;
        height: 1.2rem;
        font-size: 0.75rem;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 0 2px white;
      }
    `;
	}

	render() {
		if (!this.shadowRoot) return;

		const count = this.getCartItemsCount();

		this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <button class="cart-button" aria-label="Ver carrito de compras">
        <svg class="cart-icon" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.6 8h13.2L17 13M7 13l1.6-8m0 0h4.8M9.6 5L11 13m2 0l1.4-8" />
        </svg>
        ${count > 0 ? `<span class="cart-badge" aria-label="Productos del carrito de compras">${count}</span>` : ''}
      </button>
    `;

		this.addEventListeners();
	}
}

customElements.define('cart-button', Cart);
