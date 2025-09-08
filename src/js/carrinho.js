// Sistema de Carrinho com localStorage
class CarrinhoManager {
    constructor() {
        this.carrinho = this.carregarCarrinho();
        this.inicializarEventos();
        this.atualizarContador();
    }

    // Carrega carrinho do localStorage
    carregarCarrinho() {
        try {
            const carrinhoSalvo = localStorage.getItem('loja_carrinho');
            return carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
        } catch (error) {
            console.error('Erro ao carregar carrinho:', error);
            return [];
        }
    }

    // Salva carrinho no localStorage
    salvarCarrinho() {
        try {
            localStorage.setItem('loja_carrinho', JSON.stringify(this.carrinho));
            this.atualizarContador();
        } catch (error) {
            console.error('Erro ao salvar carrinho:', error);
        }
    }

    // Adiciona produto ao carrinho
    adicionarProduto(produto) {
        const produtoExistente = this.carrinho.find(item => item.id === produto.id);
        
        if (produtoExistente) {
            produtoExistente.quantidade += 1;
        } else {
            this.carrinho.push({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                imagem: produto.imagem || 'https://via.placeholder.com/100x100?text=Produto',
                quantidade: 1
            });
        }
        
        this.salvarCarrinho();
        this.mostrarMensagem(`${produto.nome} foi adicionado ao carrinho!`, 'sucesso');
        return true;
    }

    // Remove produto do carrinho
    removerProduto(produtoId) {
        const index = this.carrinho.findIndex(item => item.id === produtoId);
        if (index !== -1) {
            const produto = this.carrinho[index];
            this.carrinho.splice(index, 1);
            this.salvarCarrinho();
            this.mostrarMensagem(`${produto.nome} foi removido do carrinho!`, 'erro');
            return true;
        }
        return false;
    }

    // Atualiza quantidade de um produto
    atualizarQuantidade(produtoId, novaQuantidade) {
        const produto = this.carrinho.find(item => item.id === produtoId);
        
        if (produto && novaQuantidade > 0) {
            produto.quantidade = parseInt(novaQuantidade);
            this.salvarCarrinho();
            return true;
        } else if (produto && novaQuantidade <= 0) {
            this.removerProduto(produtoId);
            return true;
        }
        return false;
    }

    // Limpa todo o carrinho
    limparCarrinho() {
        this.carrinho = [];
        this.salvarCarrinho();
        this.mostrarMensagem('Carrinho limpo!', 'aviso');
    }

    // Calcula total do carrinho
    calcularTotal() {
        return this.carrinho.reduce((total, item) => {
            return total + (item.preco * item.quantidade);
        }, 0);
    }

    // Calcula quantidade total de itens
    calcularQuantidadeTotal() {
        return this.carrinho.reduce((total, item) => total + item.quantidade, 0);
    }

    // Atualiza contador no cabeçalho
    atualizarContador() {
        const contadores = document.querySelectorAll('.carrinho-contador');
        const quantidade = this.calcularQuantidadeTotal();
        
        contadores.forEach(contador => {
            contador.textContent = quantidade;
            contador.style.display = quantidade > 0 ? 'inline-block' : 'none';
        });
    }

    // Mostra mensagem de feedback
    mostrarMensagem(texto, tipo = 'sucesso') {
        const container = document.getElementById('mensagem-container') || this.criarContainerMensagem();
        
        const alerta = document.createElement('div');
        alerta.className = `alerta alerta-${tipo}`;
        
        const icones = {
            sucesso: '✅',
            erro: '❌',
            aviso: '⚠️',
            info: 'ℹ️'
        };
        
        alerta.innerHTML = `${icones[tipo] || '📣'} ${texto}`;
        container.appendChild(alerta);
        
        // Remove mensagem após 3 segundos
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }

    // Cria container para mensagens se não existir
    criarContainerMensagem() {
        const container = document.createElement('div');
        container.id = 'mensagem-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            max-width: 300px;
        `;
        document.body.appendChild(container);
        return container;
    }

    // Inicializa eventos
    inicializarEventos() {
        // Atualiza contador quando a página carrega
        document.addEventListener('DOMContentLoaded', () => {
            this.atualizarContador();
        });

        // Escuta mudanças no localStorage (para múltiplas abas)
        window.addEventListener('storage', (e) => {
            if (e.key === 'loja_carrinho') {
                this.carrinho = this.carregarCarrinho();
                this.atualizarContador();
                
                // Se estivermos na página do carrinho, recarrega
                if (window.location.pathname.includes('carrinho.html')) {
                    this.renderizarCarrinho();
                }
            }
        });
    }

    // Renderiza carrinho na página carrinho.html
    renderizarCarrinho() {
        const container = document.getElementById('itens-carrinho');
        if (!container) return;

        if (this.carrinho.length === 0) {
            container.innerHTML = `
                <div class="carrinho-vazio texto-centro" style="padding: var(--espaco-grande);">
                    <h3 style="color: var(--texto-medio); margin-bottom: var(--espaco-normal);">
                        Seu carrinho está vazio
                    </h3>
                    <p style="color: var(--texto-claro); margin-bottom: var(--espaco-normal);">
                        Que tal explorar nossos produtos?
                    </p>
                    <a href="catalogo.html" class="botao botao-azul">
                        Ver Catálogo
                    </a>
                </div>
            `;
            this.atualizarResumo();
            return;
        }

        const itensHTML = this.carrinho.map(item => `
            <div class="item-carrinho" data-produto-id="${item.id}">
                <div class="item-imagem">
                    <img src="${item.imagem}" alt="${item.nome}" style="width: 80px; height: 80px; object-fit: cover; border-radius: var(--borda-normal);">
                </div>
                
                <div class="item-info">
                    <h4 class="item-nome">${item.nome}</h4>
                    <p class="item-preco">R$ ${item.preco.toFixed(2)}</p>
                </div>
                
                <div class="item-quantidade">
                    <button class="botao botao-pequeno botao-transparente" onclick="carrinho.diminuirQuantidade('${item.id}')">-</button>
                    <input type="number" min="1" value="${item.quantidade}" 
                           class="input" style="width: 60px; text-align: center; margin: 0 var(--espaco-mini);"
                           onchange="carrinho.atualizarQuantidade('${item.id}', this.value)">
                    <button class="botao botao-pequeno botao-transparente" onclick="carrinho.aumentarQuantidade('${item.id}')">+</button>
                </div>
                
                <div class="item-subtotal">
                    <strong>R$ ${(item.preco * item.quantidade).toFixed(2)}</strong>
                </div>
                
                <div class="item-acoes">
                    <button class="botao botao-pequeno botao-transparente" 
                            onclick="carrinho.removerProduto('${item.id}')"
                            style="color: var(--cor-vermelho); border-color: var(--cor-vermelho);">
                        🗑️ Remover
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = itensHTML;
        this.atualizarResumo();
    }

    // Atualiza resumo do pedido
    atualizarResumo() {
        const resumoContainer = document.getElementById('resumo-pedido');
        if (!resumoContainer) return;

        const subtotal = this.calcularTotal();
        const frete = subtotal > 100 ? 0 : 15.90;
        const total = subtotal + frete;
        const quantidade = this.calcularQuantidadeTotal();

        resumoContainer.innerHTML = `
            <div class="card">
                <div class="card-cabecalho">
                    <h3 class="card-titulo">Resumo do Pedido</h3>
                </div>
                
                <div class="card-corpo">
                    <div class="resumo-linha">
                        <span>Itens (${quantidade}):</span>
                        <span>R$ ${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div class="resumo-linha">
                        <span>Frete:</span>
                        <span ${frete === 0 ? 'style="color: var(--cor-verde);"' : ''}>
                            ${frete === 0 ? 'GRÁTIS' : `R$ ${frete.toFixed(2)}`}
                        </span>
                    </div>
                    
                    ${frete === 0 ? '' : '<p class="texto-pequeno" style="color: var(--texto-claro); margin-top: var(--espaco-mini);">Frete grátis em compras acima de R$ 100,00</p>'}
                    
                    <hr style="margin: var(--espaco-normal) 0; border: none; border-top: 1px solid var(--cinza-medio-claro);">
                    
                    <div class="resumo-linha resumo-total">
                        <strong>Total:</strong>
                        <strong style="color: var(--cor-azul); font-size: var(--fonte-media);">R$ ${total.toFixed(2)}</strong>
                    </div>
                </div>
                
                <div class="card-rodape">
                    <button class="botao botao-verde largura-total botao-grande" 
                            onclick="carrinho.finalizarCompra()"
                            ${quantidade === 0 ? 'disabled' : ''}>
                        Finalizar Compra
                    </button>
                    
                    <button class="botao botao-transparente largura-total" 
                            onclick="carrinho.limparCarrinho()"
                            ${quantidade === 0 ? 'disabled' : ''}
                            style="margin-top: var(--espaco-pequeno);">
                        Limpar Carrinho
                    </button>
                </div>
            </div>
        `;
    }

    // Funções auxiliares para os botões
    aumentarQuantidade(produtoId) {
        const produto = this.carrinho.find(item => item.id === produtoId);
        if (produto) {
            this.atualizarQuantidade(produtoId, produto.quantidade + 1);
            this.renderizarCarrinho();
        }
    }

    diminuirQuantidade(produtoId) {
        const produto = this.carrinho.find(item => item.id === produtoId);
        if (produto && produto.quantidade > 1) {
            this.atualizarQuantidade(produtoId, produto.quantidade - 1);
            this.renderizarCarrinho();
        } else if (produto && produto.quantidade === 1) {
            this.removerProduto(produtoId);
            this.renderizarCarrinho();
        }
    }

    // Finalizar compra
    finalizarCompra() {
        if (this.carrinho.length === 0) {
            this.mostrarMensagem('Adicione produtos ao carrinho primeiro!', 'aviso');
            return;
        }

        const total = this.calcularTotal();
        const frete = total > 100 ? 0 : 15.90;
        const totalFinal = total + frete;

        // Aqui você implementaria a integração com o gateway de pagamento
        this.mostrarMensagem(`Pedido de R$ ${totalFinal.toFixed(2)} enviado para processamento!`, 'sucesso');
        
        // Por enquanto, vamos apenas limpar o carrinho após 2 segundos
        setTimeout(() => {
            this.limparCarrinho();
            this.renderizarCarrinho();
        }, 2000);
    }
}

// Funções globais para compatibilidade
function adicionarAoCarrinho(nome, preco, id = null, imagem = null) {
    // Gera ID único se não fornecido
    const produtoId = id || `produto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const produto = {
        id: produtoId,
        nome: nome,
        preco: parseFloat(preco),
        imagem: imagem || 'https://via.placeholder.com/100x100?text=Produto'
    };
    
    window.carrinho.adicionarProduto(produto);
}

// Inicializa carrinho quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    window.carrinho = new CarrinhoManager();
    
    // Se estivermos na página do carrinho, renderiza os itens
    if (window.location.pathname.includes('carrinho.html')) {
        window.carrinho.renderizarCarrinho();
    }
});