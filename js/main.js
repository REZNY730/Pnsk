Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
    <ul>
      <li v-for="detail in details" :key="detail">{{ detail }}</li>
    </ul>
  `
});
Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
    <div class="product">
      <div class="product-image">
        <img v-bind:alt="altText" v-bind:src="image">
      </div>
      <div class="product-info">
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
        <a class="link" :href="link">More products like this</a>
        <p v-if="inventory > 10">In Stock</p>
        <p v-else-if="inventory <= 10 && inventory > 0">Almost sold out!</p>
        <p v-else :class="{ strikethrough: !inStock }">Out of Stock</p>
        <span>{{ onsale }}</span>
        <p>{{ sale }}</p>
        
        <product-details :details="details"></product-details>
        
        <div 
            class="color-box" 
            v-for="(variant, index) in variants" 
            :key="variant.variantId" 
            :style="{ backgroundColor: variant.variantColor }" 
            @mouseover="updateProduct(index)">
        </div>
        <ul>
          <li v-for="sizes in sizes">{{ sizes }}</li>
        </ul>
        <div class="cart">
          <p>Cart({{ cart }})</p>
        </div>
        <button 
            v-on:click="addToCart" 
            :disabled="!inStock" 
            class="{ disabledButton: !inStock }"
            >
             Add to cart 
             </button>
        <button v-on:click="deletToCart">Delet to cart</button>
      </div>
    </div>
`,
    data() {
        return {
        product: "Socks",
        brand: 'Vue Mastery',
        description: "A pair of warm, fuzzy socks",
        selectedVariant: 0,
        altText: "A pair of socks",
        link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks.",
        inStock: true,
        inventory: 100,
        onsale: "On Sale",
        onSale: true,
        details: ['80% cotton', '20% polyester', 'Gender-neutral'],
        variants: [
            {
                variantId: 2234,
                variantColor: 'green',
                variantImage: "./assets/vmSocks-green-onWhite.jpg",
                variantQuantity: 10
            },
            {
                variantId: 2235,
                variantColor: 'blue',
                variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                variantQuantity: 0
            }
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        cart: 0,
    }
},
    methods: {
        addToCart() {
            this.cart += 1
        },
        deletToCart() {
            if (this.cart > 0)
            this.cart -= 1
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock(){
            return this.variants[this.selectedVariant].variantQuantity
        },
        sale() {
            return this.onSale ? `${this.brand} ${this.product} is on sale!` : `${this.brand} ${this.product} is not on sale.`;
        },
    }
})
    let app = new Vue({
        el: '#app',
        data: {
            premium: true
        }
    })
