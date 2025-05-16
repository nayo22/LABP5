class ProductCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  static get observedAttributes() {
    return [
      "data-id",
      "data-title",
      "data-price",
      "data-image",
      "data-description",
      "data-category",
    ];
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  private getStyles() {
  return `
    :host {
      display: block;
    }

    .card {
      border-radius: var(--radius);
      background: var(--surface);
      box-shadow: var(--shadow);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease;
      max-width: 320px;
      width: 100%;
    }

    .card:hover {
      transform: translateY(-4px);
    }

    .card-image {
      height: 200px;
      background: rgb(255, 255, 255);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .card-image img {
      max-height: 100%;
      max-width: 100%;
      object-fit: contain;
    }

    .card-content {
      padding: 1rem;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .card-category {
      font-size: 0.8rem;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 0.3rem;
    }

    .card-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 0.5rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-price {
      font-size: 1.2rem;
      font-weight: bold;
      color: var(--primary);
      margin-bottom: 1rem;
      text-align: right;
    }

    .btn {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      font-weight: 600;
      padding: 0.6rem 1rem;
      font-size: 0.9rem;
      border-radius: var(--radius);
      border: none;
      cursor: pointer;
      transition: background 0.3s ease;
      width: 100%;
    }

    .btn:hover {
      background: linear-gradient(135deg, var(--secondary), var(--primary));
    }
  `;
}

  private addEventListeners() {
    const addToCartBtn = this.shadowRoot?.querySelector(".add-to-cart-btn");
    addToCartBtn?.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("add-to-cart", {
          bubbles: true,
          composed: true,
        })
      );
    });
  }

  render() {
    if (!this.shadowRoot) return;

    const title = this.getAttribute("data-title") || "Producto sin título";
    const price = parseFloat(this.getAttribute("data-price") || "0");
    const image = this.getAttribute("data-image") || "";
    const category = this.getAttribute("data-category") || "";

    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="card">
        <div class="card-image">
          <img src="${image}" alt="${title}" loading="lazy">
        </div>
        <div class="card-content">
          <div class="card-category">${category}</div>
          <h3 class="card-title" title="${title}">${title}</h3>
          <div class="card-price">$${price.toFixed(2)}</div>
          <button class="btn add-to-cart-btn">Añadir al carrito</button>
        </div>
      </div>
    `;
  }
}

customElements.define("product-card", ProductCard);