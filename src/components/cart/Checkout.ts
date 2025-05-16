import { store, State } from "../../flux/Store";
import { CartActions } from "../../flux/Actions";

class Checkout extends HTMLElement {
  private state: State = store.getState();
  private isSubmitting = false;
  private isSuccess = false;
  private errorMessage: string | null = null;

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

  private getCartTotal(): number {
    return this.state.cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  private addEventListeners() {
    const form = this.shadowRoot?.querySelector("form");
    form?.addEventListener("submit", this.handleSubmit.bind(this));

    const cancelButton = this.shadowRoot?.querySelector(".cancel-btn");
    cancelButton?.addEventListener("click", (e) => {
      e.preventDefault();
      this.dispatchEvent(
        new CustomEvent("toggle-checkout", {
          bubbles: true,
          composed: true,
        })
      );
    });
  }

  private handleSubmit(e: Event) {
    e.preventDefault();
    if (this.isSubmitting) return;

    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const name = data.get("name")?.toString().trim();
    const email = data.get("email")?.toString().trim();
    const address = data.get("address")?.toString().trim();

    if (!name || !email || !address) {
      this.errorMessage = "No dejes espacios vacíos porfi";
      this.render();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.render();

    setTimeout(() => {
      this.isSubmitting = false;
      this.isSuccess = true;
      this.render();

      setTimeout(() => {
        CartActions.clearCart();
        this.isSuccess = false;
        this.dispatchEvent(
          new CustomEvent("toggle-checkout", {
            bubbles: true,
            composed: true,
          })
        );
      }, 2000);
    }, 1500);
  }

  private getStyles() {
    return `
      :host {
        display: block;
      }

      .modal {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 200;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }

      .content {
          background: var(--surface);
          border-radius: var(--radius);
          max-width: 480px;
          width: 100%;
          padding: 2rem;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
      }

      h2 {
        margin-top: 0;
        color: var(--secondary);
        text-align: center;
      }

      form {
        margin-top: 1rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
      }

      input, textarea {
        width: 100%;
        max-width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid #ddd;
        border-radius: var(--radius, 8px);
        font-size: 1rem;
        background-color:rgb(67, 67, 67);
        color: white;
        font-family: inherit;
        text-align: left;
      }

      textarea {
        min-height: 70px;
        resize: vertical;
      }

      .btn-group {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
      }

      .btn {
        flex: 1;
        padding: 0.75rem;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        font-size: 1rem;
      }

      .submit-btn {
        background: linear-gradient(135deg, var(--primary, #6c63ff), var(--secondary, #e58ad9));
        color: white;
      }

      .cancel-btn {
        background-color: #eee;
        color: #333;
      }

      .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top: 4px solid var(--primary);
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 1rem auto;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .error-message {
        color: var(--danger, #ff6b6b);
        background: rgba(255, 107, 107, 0.1);
        padding: 0.75rem;
        border-radius: 40px;
        margin-bottom: 1rem;
      }

      .success-message {
        text-align: center;
        padding: 1rem;
        border-radius: 40px;
        color:rgb(255, 255, 255);
      }
    `;
  }

  render() {
    if (!this.shadowRoot) return;
    const total = this.getCartTotal();

    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="modal">
        <div class="content">
          <h2>Terminar Compra</h2>

          ${
            this.isSubmitting
              ? `<div class="spinner"></div><p style="text-align:center;">Empacando las mechitas</p>`
              : this.isSuccess
              ? `<div class="success-message">Todo listoo! relajate que ya casi llega :D</div>`
              : `
              ${
                this.errorMessage
                  ? `<div class="error-message">${this.errorMessage}</div>`
                  : ""
              }

              <form>
                <div class="form-group">
                  <label for="name">Nombre y apellidos</label>
                  <input type="text" name="name" id="name" required />
                </div>

                <div class="form-group">
                  <label for="email">Mail</label>
                  <input type="email" name="email" id="email" required />
                </div>

                <div class="form-group">
                  <label for="address">Dirección</label>
                  <textarea name="address" id="address" required></textarea>
                </div>

                <p style="text-align:right; font-weight:600;">Total: $${total.toFixed(2)}</p>

                <div class="btn-group">
                  <button type="submit" class="btn submit-btn">Comprar</button>
                  <button type="button" class="btn cancel-btn">Cancelar</button>
                </div>
              </form>
            `
          }
        </div>
      </div>
    `;

    this.addEventListeners();
  }
}

customElements.define("checkout-form", Checkout);