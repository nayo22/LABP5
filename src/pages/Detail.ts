import { store, State } from "../flux/Store";
import { CartActions } from "../flux/Actions";
import { getProductById } from "../service/ApiService";
import { Product } from "../types/ProductTypes";

class Detail extends HTMLElement {
  private state: State = store.getState();
  private product: Product | null = null;
  private isLoading = false;
  private error: string | null = null;

  static get observedAttributes() {
    return ["product-id"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    store.subscribe(this.handleStateChange.bind(this));
    this.render();
    this.loadProduct();
  }

  disconnectedCallback() {
    store.unsubscribe(this.handleStateChange.bind(this));
  }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (name === "product-id" && oldVal !== newVal) {
      this.loadProduct();
    }
  }

  private handleStateChange(state: State) {
    this.state = state;
    this.render();
  }

  private async loadProduct() {
    const id = this.getAttribute("product-id");
    if (!id) return;

    this.isLoading = true;
    this.error = null;
    this.render();

    const existing = this.state.products.find(p => p.id.toString() === id);

    try {
      this.product = existing || await getProductById(parseInt(id));
    } catch {
  this.error = "Error al cargar el producto";
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  private addEventListeners() {
    const btn = this.shadowRoot?.querySelector(".add-btn");
    const input = this.shadowRoot?.querySelector("#quantity") as HTMLInputElement;

    btn?.addEventListener("click", () => {
      if (!this.product) return;

      const qty = parseInt(input?.value || "1");
      CartActions.addToCart(this.product, qty);

      const msg = this.shadowRoot?.querySelector(".added-msg");
      msg?.classList.add("visible");
      setTimeout(() => msg?.classList.remove("visible"), 2000);
    });
  }

  private getStyles() {
    return `
      :host {
        display: block;
      }

      .detail {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        margin: 2rem 0;
      }

      .image-box {
        flex: 1;
        min-width: 280px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #f6f6f6;
        padding: 2rem;
        border-radius: 10px;
      }

      .image-box img {
        max-width: 100%;
        max-height: 400px;
        object-fit: contain;
      }

      .info {
        flex: 1;
        min-width: 300px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .category {
        font-size: 0.8rem;
        color: #888;
        text-transform: uppercase;
      }

      .title {
        font-size: 1.8rem;
        font-weight: bold;
        color: var(--text-color, #333);
        margin: 0;
      }

      .price {
        font-size: 1.4rem;
        color: var(--primary-color, #4c7cff);
        font-weight: bold;
      }

      .desc {
        line-height: 1.6;
        color: #444;
        font-size: 1rem;
      }

      .quantity {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
      }

      .quantity label {
        font-weight: 600;
      }

      #quantity {
        width: 3rem;
        padding: 0.5rem;
        font-size: 1rem;
        border: 1px solid #ccc;
        border-radius: 6px;
      }

      .add-btn {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: bold;
        margin-top: 1rem;
        cursor: pointer;
      }

      .add-btn:hover {
        background: var(--primary-color-dark, #3a5dbe);
      }

      .back {
        display: inline-block;
        color: #666;
        text-decoration: none;
        margin-bottom: 1rem;
        font-size: 0.9rem;
      }

      .back:hover {
        color: var(--primary-color);
      }

      .added-msg {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: #d4f7d4;
        color: #2e7d32;
        border-radius: 4px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .added-msg.visible {
        opacity: 1;
      }

      .loading, .error {
        padding: 2rem;
        text-align: center;
      }

      .error {
        color: var(--accent-color);
      }
    `;
  }

  render() {
    if (!this.shadowRoot) return;

    const p = this.product;

    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <a href="#" class="back">← Volver a la tienda</a>

      ${this.isLoading ? `<div class="loading">Cargando producto...</div>` : ""}
      ${this.error ? `<div class="error">${this.error}</div>` : ""}

      ${
        p
          ? `
        <div class="detail">
          <div class="image-box">
            <img src="${p.image}" alt="${p.title}" />
          </div>
          <div class="info">
            <div class="category">${p.category}</div>
            <h1 class="title">${p.title}</h1>
            <div class="price">$${p.price.toFixed(2)}</div>
            <p class="desc">${p.description}</p>
            <div class="quantity">
              <label for="quantity">Cantidad:</label>
              <input type="number" id="quantity" min="1" value="1" />
            </div>
            <button class="add-btn">Agregar al carrito</button>
            <div class="added-msg">¡Producto agregado al carrito!</div>
          </div>
        </div>
      `
          : ""
      }
    `;

    if (p) this.addEventListeners();
  }
}

customElements.define("product-detail-page", Detail);