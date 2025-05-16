import { State, store } from '../flux/Store';
import { getProductsCacheFirst } from '../service/ApiService';
import { ProductActions } from '../flux/Actions';
import './products/ProductList';
import './cart/Cart';
import './cart/Sidebar';
import '../pages/HomePage';
import '../pages/Detail';

class AppContainer extends HTMLElement {
	private state: State = store.getState();
	private isCartOpen = false;

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		store.subscribe(this.handleStateChange.bind(this));
		this.render();
		this.loadProducts();
	}

	disconnectedCallback() {
		store.unsubscribe(this.handleStateChange.bind(this));
	}

	private handleStateChange(state: State) {
		this.state = state;
		this.render();
	}

	private handleToggleCart() {
		this.isCartOpen = !this.isCartOpen;
		this.render();
	}

	private addEventListeners() {
		this.shadowRoot?.addEventListener('toggle-cart', this.handleToggleCart.bind(this));
    this.shadowRoot?.addEventListener('.overlay', this.handleToggleCart.bind(this));
	}


	private async loadProducts() {
		try {
			ProductActions.setLoading(true);
			const products = await getProductsCacheFirst();
			ProductActions.loadProducts(products);
		} catch {
			ProductActions.setError('No se pudieron cargar los productos.');
		} finally {
			ProductActions.setLoading(false);
		}
	}

	private getStyles() {
		return `
      :host {
        display: block;
        font-family: 'Segoe UI', sans-serif;
        --primary-color: rgb(194, 57, 159);
        --secondary-color: #f3f3f3;
        --text-color: #333;
        --accent-color: rgb(170, 132, 227);
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
      }

      .header {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        margin-left: calc(-50vw + 50%);
        padding: 1rem 2rem;
        border-bottom: 1px solid #333;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-sizing: border-box;
        background-color: var(--background, #111);
        z-index: 1000;
      }

      .logo-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .logo-title img {
        width: 36px;
        height: 36px;
        object-fit: contain;
      }

      .logo-title h1 {
        margin: 0;
        color: var(--primary-color);
        font-size: 1.8rem;
      }

      main {
        padding-top: 80px;
        padding-bottom: 2rem;
      }

      .loading,
      .error {
        text-align: center;
        padding: 2rem;
        border-radius: 6px;
        font-size: 1.1rem;
      }

      .loading {
        color: var(--primary-color);
      }

      .error {
        color: var(--accent-color);
        border: 1px solid var(--accent-color);
        background-color: #fff0f0;
      }

      .overlay {
        display: ${this.isCartOpen ? 'block' : 'none'};
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 50;
      }
    `;
	}

	render() {
		if (!this.shadowRoot) return;

		const { isLoading, error } = this.state;

		this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="container">
        <header class="header">
          <div class="logo-title">
            <img src="/img/Lunaricon.png" alt="Logo">
            <h1>BestFitEver</h1>
          </div>
          <cart-button></cart-button>
        </header>

        <main>
          ${isLoading ? `<div class="loading">Cargando productos...</div>` : ''}
          ${error ? `<div class="error">${error}</div>` : ''}
          <home-page></home-page>
        </main>

        
        <cart-sidebar ${this.isCartOpen ? 'open' : ''}></cart-sidebar>
      </div>
    `;

		this.addEventListeners();
	}
}

export default AppContainer;
