// products.js - Gerenciamento de produtos
class ProductManager {
    constructor() {
        this.products = [];
        this.currentCategory = 'all';
        this.currentSort = 'name';
        this.currentView = 'grid';
        this.init();
    }
    
    init() {
        this.loadProducts();
        this.bindEvents();
        this.initFilters();
        this.initSearch();
    }
    
    // Carregar produtos (simula API)
    loadProducts() {
        // Exemplo de estrutura de produtos
        this.products = [
            {
                id: 1,
                name: 'Produto Exemplo 1',
                price: 29.90,
                category: 'categoria1',
                image: 'images/produto1.jpg',
                description: 'Descrição do produto 1',
                inStock: true,
                rating: 4.5,
                reviews: 127
            },
            {
                id: 2,
                name: 'Produto Exemplo 2',
                price: 45.90,
                category: 'categoria2',
                image: 'images/produto2.jpg',
                description: 'Descrição do produto 2',
                inStock: true,
                rating: 4.2,
                reviews: 89
            }
            // Adicione mais produtos conforme necessário
        ];
        
        this.renderProducts();
    }
    
    // Renderizar produtos
    renderProducts(productsToRender = null) {
        const container = document.getElementById('products-container');
        if (!container) return;
        
        const products = productsToRender || this.getFilteredProducts();
        
        if (products.length === 0) {
            container.innerHTML = '<div class="no-products">Nenhum produto encontrado.</div>';
            return;
        }
        
        container.innerHTML = products.map(product => this.createProductHTML(product)).join('');
        
        // Reativar eventos após renderizar
        this.bindProductEvents();
    }
    
    // Criar HTML do produto
    createProductHTML(product) {
        const isGridView = this.currentView === 'grid';
        
        return `
            <div class="product-item ${this.currentView}-view" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="product-actions">
                        <button class="btn-action quick-view-btn" data-product-id="${product.id}" title="Visualização rápida">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action wishlist-btn" data-product-id="${product.id}" title="Adicionar aos favoritos">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="btn-action compare-btn" data-product-id="${product.id}" title="Comparar">
                            <i class="fas fa-exchange-alt"></i>
                        </button>
                    </div>
                    ${!product.inStock ? '<div class="out-of-stock">Fora de Estoque</div>' : ''}
                </div>
                
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    
                    <div class="product-rating">
                        ${this.createStarRating(product.rating)}
                        <span class="rating-count">(${product.reviews})</span>
                    </div>
                    
                    <div class="product-price">
                        <span class="current-price">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                    
                    ${!isGridView ? `<p class="product-description">${product.description}</p>` : ''}
                    
                    <div class="product-actions-bottom">
                        <button class="btn btn-primary add-to-cart-btn" 
                                data-product-id="${product.id}" 
                                ${!product.inStock ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i>
                            ${product.inStock ? 'Adicionar ao Carrinho' : 'Fora de Estoque'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Criar rating com estrelas
    createStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let starsHTML = '';
        
        // Estrelas cheias
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }
        
        // Meia estrela
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Estrelas vazias
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }
        
        return `<div class="stars" data-rating="${rating}">${starsHTML}</div>`;
    }
    
    // Obter produtos filtrados
    getFilteredProducts() {
        let filteredProducts = [...this.products];
        
        // Filtrar por categoria
        if (this.currentCategory !== 'all') {
            filteredProducts = filteredProducts.filter(product => 
                product.category === this.currentCategory
            );
        }
        
        // Filtrar por busca
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase();
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        }
        
        // Ordenar produtos
        this.sortProducts(filteredProducts);
        
        return filteredProducts;
    }
    
    // Ordenar produtos
    sortProducts(products) {
        switch (this.currentSort) {
            case 'name':
                products.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price-low':
                products.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                products.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                products.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                products.sort((a, b) => b.id - a.id);
                break;
        }
    }
    
    // Vincular eventos
    bindEvents() {
        // Botões de categoria
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterByCategory(btn.dataset.category);
            });
        });
        
        // Select de ordenação
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy(e.target.value);
            });
        }
        
        // Botões de visualização
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeView(btn.dataset.view);
            });
        });
    }
    
    // Vincular eventos dos produtos
    bindProductEvents() {
        // Adicionar ao carrinho
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(btn.dataset.productId);
                this.addToCart(productId);
            });
        });
        
        // Quick view
        document.querySelectorAll('.quick-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = parseInt(btn.dataset.productId);
                this.openQuickView(productId);
            });
        });
        
        // Wishlist
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleWishlist(btn);
            });
        });
    }
    
    // Inicializar filtros
    initFilters() {
        // Filtro de preço
        const priceRange = document.getElementById('price-range');
        if (priceRange) {
            priceRange.addEventListener('input', () => {
                this.filterByPrice();
            });
        }
        
        // Checkboxes de filtro
        document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.applyFilters();
            });
        });
    }
    
    // Inicializar busca
    initSearch() {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchInput) {
            // Busca em tempo real com debounce
            const debouncedSearch = Utils.debounce(() => {
                this.renderProducts();
            }, 300);
            
            searchInput.addEventListener('input', debouncedSearch);
            
            // Busca ao pressionar Enter
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.renderProducts();
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.renderProducts();
            });
        }
    }
    
    // Filtrar por categoria
    filterByCategory(category) {
        this.currentCategory = category;
        
        // Atualizar botões ativos
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`)?.classList.add('active');
        
        this.renderProducts();
    }
    
    // Ordenar por
    sortBy(sortType) {
        this.currentSort = sortType;
        this.renderProducts();
    }
    
    // Mudar visualização
    changeView(viewType) {
        this.currentView = viewType;
        
        // Atualizar botões ativos
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewType}"]`)?.classList.add('active');
        
        // Atualizar classe do container
        const container = document.getElementById('products-container');
        if (container) {
            container.className = `products-${viewType}`;
        }
        
        this.renderProducts();
    }
    
    // Adicionar ao carrinho
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product && product.inStock) {
            // Chama função do carrinho.js se existir
            if (typeof addToCart === 'function') {
                addToCart(product);
            } else {
                // Implementação básica
                console.log('Produto adicionado ao carrinho:', product);
                showNotification('Produto adicionado ao carrinho!', 'success');
            }
        }
    }
    
    // Abrir quick view
    openQuickView(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            const modal = document.getElementById('quickViewModal');
            if (modal) {
                this.populateQuickViewModal(product);
                openModal(modal);
            }
        }
    }
    
    // Popular modal de quick view
    populateQuickViewModal(product) {
        const modal = document.getElementById('quickViewModal');
        if (!modal) return;
        
        modal.querySelector('.modal-title').textContent = product.name;
        modal.querySelector('.product-image img').src = product.image;
        modal.querySelector('.product-price').textContent = `R$ ${product.price.toFixed(2).replace('.', ',')}`;
        modal.querySelector('.product-description').textContent = product.description;
        modal.querySelector('.product-rating').innerHTML = this.createStarRating(product.rating);
        
        const addToCartBtn = modal.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.onclick = () => this.addToCart(product.id);
            addToCartBtn.disabled = !product.inStock;
            addToCartBtn.textContent = product.inStock ? 'Adicionar ao Carrinho' : 'Fora de Estoque';
        }
    }
    
    // Obter produto por ID
    getProduct(id) {
        return this.products.find(product => product.id === parseInt(id));
    }
    
    // Atualizar estoque
    updateStock(productId, inStock) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            product.inStock = inStock;
            this.renderProducts();
        }
    }
}

// Inicializar gerenciador de produtos
document.addEventListener('DOMContentLoaded', function() {
    window.productManager = new ProductManager();
});

// Funções auxiliares para integração
function getProductById(id) {
    return window.productManager ? window.productManager.getProduct(id) : null;
}

function refreshProducts() {
    if (window.productManager) {
        window.productManager.renderProducts();
    }
}

function searchProducts(query) {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = query;
        if (window.productManager) {
            window.productManager.renderProducts();
        }
    }
}