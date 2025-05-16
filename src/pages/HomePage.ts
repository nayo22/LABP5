import '../components/products/ProductList';

class HomePage extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		this.render();
	}

	private getStyles() {
  return `
    :host {
      display: block;
    }

    .hero-wrapper {
      width: 100vw;
      margin-left: calc(-50vw + 50%);
      position: relative;
      background-image: url('/img/1986-nebo.gif');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      overflow: hidden;
    }

    .hero-wrapper::before {
      content: "";
      position: absolute;
      inset: 0;
      background: rgba(255, 0, 255, 0.4); 
      z-index: 1;
    }

    .hero {
      color: white;
      padding: 3rem 2rem;
      text-align: left;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 2;
    }

    .hero h2 {
      font-size: 2.2rem;
      margin: 0;
      color: white;
    }

    .hero p {
      font-size: 1.1rem;
      opacity: 0.9;
      margin-top: 1rem;
    }

    .section-title {
      font-size: 1.8rem;
      margin: 2rem 0 1rem;
      color: white;
      text-align: left;
    }
  `;
}

	render() {
		if (!this.shadowRoot) return;

		this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>

   <div class="hero-wrapper">
     <div class="hero">
    <h2>Welcome to BestFitEver</h2>
    <p>Descubre nuestra selección de productos de calidad no china con un estilo furro y ñerocore</p>
      </div>
  </div>

      <h2 class="section-title">Cositas para mecatear👚</h2>
      <product-list></product-list>
    `;
	}
}

customElements.define('home-page', HomePage);
