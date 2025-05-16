// src/components/products/ProductList.ts
import { store, State } from "../../flux/Store";
import { CartActions } from "../../flux/Actions";
import "./ProductCard";

class ProductList extends HTMLElement {
  private state: State = store.getState();

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    store.subscribe(this.handleStateChange.bind(this));
    this.render();
  }

  disconnectedCallback() {
    store.unsubscribe(this.handleStateChange.bind(this));
  }

  private handleStateChange(state: State) {
    this.state = state;
    this.render();
  }

  private getStyles() {
  return `
    :host {
      display: block;
      padding: 1rem;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      max-width: 1100px;             /* LIMITA el ancho total */
      margin: 0 auto;                /* CENTRA el grid */
      padding: 1rem;
    }

    @media (max-width: 1000px) {
      .grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }

    .empty {
      text-align: center;
      padding: 2rem;
      font-size: 1.1rem;
      color: #777;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      font-size: 1.1rem;
      color: var(--primary-color, #4c7cff);
    }
  `;
}

  private render() {
    if (!this.shadowRoot) return;

    const { products, isLoading } = this.state;

    const content = isLoading
      ? `<div class="loading">Cargando productos...</div>`
      : products.length === 0
      ? `<div class="empty">No hay productos disponibles</div>`
      : `
        <div class="grid">
          ${products
            .map(
              (p) => `
                <product-card
                  data-id="${p.id}"
                  data-title="${p.title}"
                  data-price="${p.price}"
                  data-image="${p.image}"
                  data-description="${p.description.replace(/"/g, "&quot;")}"
                  data-category="${p.category}"
                ></product-card>
              `
            )
            .join("")}
        </div>
      `;

    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      ${content}
    `;

    this.addEventListeners();
  }

  private addEventListeners() {
    const cards = this.shadowRoot?.querySelectorAll("product-card");
    cards?.forEach((card) => {
      card.addEventListener("add-to-cart", (e: Event) => {
        const id = parseInt(
          (e.target as HTMLElement).getAttribute("data-id") || "0"
        );
        const product = this.state.products.find((p) => p.id === id);
        if (product) {
          CartActions.addToCart(product, 1);
        }
      });
    });
  }
}

customElements.define("product-list", ProductList);