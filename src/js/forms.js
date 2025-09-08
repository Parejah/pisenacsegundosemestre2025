// forms.js - Gerenciamento avançado de formulários
class FormManager {
    constructor() {
        this.forms = new Map();
        this.validators = new Map();
        this.init();
    }
    
    init() {
        this.setupValidators();
        this.bindFormEvents();
        this.initAddressForms();
        this.initPaymentForms();
    }
    
    // Configurar validadores personalizados
    setupValidators() {
        this.validators.set('required', (value) => {
            return value.trim() !== '';
        });
        
        this.validators.set('email', (value) => {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(value);
        });
        
        this.validators.set('cpf', (value) => {
            const cpf = value.replace(/[^\d]/g, '');
            return this.validateCPF(cpf);
        });
        
        this.validators.set('phone', (value) => {
            const phone = value.replace(/[^\d]/g, '');
            return phone.length >= 10 && phone.length <= 11;
        });
        
        this.validators.set('cep', (value) => {
            const cep = value.replace(/[^\d]/g, '');
            return cep.length === 8;
        });
        
        this.validators.set('password', (value) => {
            return value.length >= 6;
        });
        
        this.validators.set('confirmPassword', (value, form) => {
            const passwordField = form.querySelector('input[name="password"]');
            return passwordField ? value === passwordField.value : false;
        });
    }
    
    // Vincular eventos dos formulários
    bindFormEvents() {
        document.querySelectorAll('form').forEach(form => {
            this.initForm(form);
        });
    }
    
    // Inicializar formulário específico
    initForm(form) {
        const formId = form.id || `form-${Date.now()}`;
        form.id = formId;
        
        this.forms.set(formId, {
            element: form,
            fields: new Map(),
            isValid: false
        });
        
        // Eventos do formulário
        form.addEventListener('submit', (e) => this.handleSubmit(e, formId));
        
        // Inicializar campos
        const fields = form.querySelectorAll('input, textarea, select');
        fields.forEach(field => this.initField(field, formId));
    }
    
    // Inicializar campo específico
    initField(field, formId) {
        const fieldName = field.name || field.id;
        if (!fieldName) return;
        
        const formData = this.forms.get(formId);
        formData.fields.set(fieldName, {
            element: field,
            isValid: false,
            errors: []
        });
        
        // Eventos do campo
        field.addEventListener('blur', () => this.validateField(field, formId));
        field.addEventListener('input', () => this.clearFieldErrors(field));
        
        // Máscaras específicas
        this.applyMask(field);
        
        // Auto-complete para CEP
        if (field.name === 'cep') {
            field.addEventListener('blur', () => this.autoFillAddress(field));
        }
    }
    
    // Aplicar máscaras aos campos
    applyMask(field) {
        const fieldName = field.name;
        const fieldType = field.type;
        
        if (fieldName === 'cpf') {
            field.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                e.target.value = value;
            });
        }
        
        if (fieldName === 'cnpj') {
            field.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
                e.target.value = value;
            });
        }
        
        if (fieldType === 'tel' || fieldName === 'phone') {
            field.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                    if (value.length <= 10) {
                        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                    } else {
                        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                    }
                }
                e.target.value = value;
            });
        }
        
        if (fieldName === 'cep') {
            field.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
                e.target.value = value;
            });
        }
        
        if (fieldName === 'card_number') {
            field.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
                e.target.value = value;
            });
        }
        
        if (fieldName === 'card_expiry') {
            field.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{2})(\d{2})/, '$1/$2');
                e.target.value = value;
            });
        }
    }
    
    // Validar campo
    validateField(field, formId) {
        const fieldName = field.name;
        const value = field.value.trim();
        const formData = this.forms.get(formId);
        const fieldData = formData.fields.get(fieldName);
        
        fieldData.errors = [];
        fieldData.isValid = true;
        
        // Validações baseadas em atributos
        const validations = field.dataset.validate?.split('|') || [];
        if (field.hasAttribute('required')) {
            validations.unshift('required');
        }
        
        // Aplicar validações
        for (const validation of validations) {
            const [rule, param] = validation.split(':');
            const validator = this.validators.get(rule);
            
            if (validator && !validator(value, formData.element)) {
                fieldData.isValid = false;
                fieldData.errors.push(this.getErrorMessage(rule, param));
                break;
            }
        }
        
        // Mostrar/limpar erros
        if (!fieldData.isValid) {
            this.showFieldError(field, fieldData.errors[0]);
        } else {
            this.clearFieldErrors(field);
        }
        
        // Atualizar status do formulário
        this.updateFormStatus(formId);
        
        return fieldData.isValid;
    }
    
    // Obter mensagem de erro
    getErrorMessage(rule, param) {
        const messages = {
            required: 'Este campo é obrigatório',
            email: 'Digite um email válido',
            cpf: 'Digite um CPF válido',
            cnpj: 'Digite um CNPJ válido',
            phone: 'Digite um telefone válido',
            cep: 'Digite um CEP válido',
            password: 'A senha deve ter pelo menos 6 caracteres',
            confirmPassword: 'As senhas não coincidem'
        };
        
        return messages[rule] || 'Campo inválido';
    }
    
    // Mostrar erro do campo
    showFieldError(field, message) {
        field.classList.add('is-invalid');
        
        let errorElement = field.parentNode.querySelector('.invalid-feedback');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.classList.add('invalid-feedback');
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    // Limpar erros do campo
    clearFieldErrors(field) {
        field.classList.remove('is-invalid');
        
        const errorElement = field.parentNode.querySelector('.invalid-feedback');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
    
    // Atualizar status do formulário
    updateFormStatus(formId) {
        const formData = this.forms.get(formId);
        const allFieldsValid = Array.from(formData.fields.values())
            .every(field => field.isValid);
        
        formData.isValid = allFieldsValid;
        
        // Atualizar botão de submit
        const submitBtn = formData.element.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = !allFieldsValid;
        }
    }
    
    // Lidar com submit do formulário
    handleSubmit(e, formId) {
        e.preventDefault();
        
        const formData = this.forms.get(formId);
        const form = formData.element;
        
        // Validar todos os campos
        let allValid = true;
        formData.fields.forEach((fieldData, fieldName) => {
            const field = fieldData.element;
            if (!this.validateField(field, formId)) {
                allValid = false;
            }
        });
        
        if (!allValid) {
            showNotification('Por favor, corrija os erros no formulário', 'error');
            return false;
        }
        
        // Processar formulário baseado no tipo
        this.processForm(form);
        
        return true;
    }
    
    // Processar formulário
    processForm(form) {
        const formType = form.dataset.type;
        const formData = new FormData(form);
        
        switch (formType) {
            case 'contact':
                this.processContactForm(formData);
                break;
            case 'checkout':
                this.processCheckoutForm(formData);
                break;
            case 'login':
                this.processLoginForm(formData);
                break;
            case 'register':
                this.processRegisterForm(formData);
                break;
            default:
                this.processGenericForm(formData, form);
        }
    }
    
    // Processar formulário de contato
    processContactForm(formData) {
        showNotification('Mensagem enviada com sucesso!', 'success');
        console.log('Dados do contato:', Object.fromEntries(formData));
    }
    
    // Processar formulário de checkout
    processCheckoutForm(formData) {
        showNotification('Pedido realizado com sucesso!', 'success');
        console.log('Dados do checkout:', Object.fromEntries(formData));
        
        // Redirecionar para página de confirmação
        setTimeout(() => {
            window.location.href = '/confirmacao';
        }, 2000);
    }
    
    // Processar formulário de login
    processLoginForm(formData) {
        const email = formData.get('email');
        const password = formData.get('password');
        
        // Simular login
        showNotification('Login realizado com sucesso!', 'success');
        console.log('Login:', { email, password });
        
        // Armazenar sessão
        sessionStorage.setItem('user', JSON.stringify({ email }));
        
        // Redirecionar
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1000);
    }
    
    // Processar formulário de registro
    processRegisterForm(formData) {
        showNotification('Cadastro realizado com sucesso!', 'success');
        console.log('Registro:', Object.fromEntries(formData));
    }
    
    // Processar formulário genérico
    processGenericForm(formData, form) {
        showNotification('Formulário enviado com sucesso!', 'success');
        console.log('Dados do formulário:', Object.fromEntries(formData));
        form.reset();
    }
    
    // Auto-preenchimento de endereço via CEP
    async autoFillAddress(cepField) {
        const cep = cepField.value.replace(/\D/g, '');
        
        if (cep.length !== 8) return;
        
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            if (data.erro) {
                showNotification('CEP não encontrado', 'error');
                return;
            }
            
            // Preencher campos
            const form = cepField.closest('form');
            const addressField = form.querySelector('input[name="address"], input[name="endereco"]');
            const neighborhoodField = form.querySelector('input[name="neighborhood"], input[name="bairro"]');
            const cityField = form.querySelector('input[name="city"], input[name="cidade"]');
            const stateField = form.querySelector('input[name="state"], input[name="estado"], select[name="state"], select[name="estado"]');
            
            if (addressField) addressField.value = data.logradouro;
            if (neighborhoodField) neighborhoodField.value = data.bairro;
            if (cityField) cityField.value = data.localidade;
            if (stateField) stateField.value = data.uf;
            
            showNotification('Endereço preenchido automaticamente', 'success');
            
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            showNotification('Erro ao buscar CEP', 'error');
        }
    }
    
    // Inicializar formulários de endereço
    initAddressForms() {
        // Toggle entre endereço de entrega e cobrança
        const sameAddressCheckbox = document.getElementById('same-address');
        if (sameAddressCheckbox) {
            sameAddressCheckbox.addEventListener('change', (e) => {
                const billingSection = document.getElementById('billing-address');
                if (billingSection) {
                    billingSection.style.display = e.target.checked ? 'none' : 'block';
                }
            });
        }
    }
    
    // Inicializar formulários de pagamento
    initPaymentForms() {
        // Toggle entre métodos de pagamento
        const paymentMethods = document.querySelectorAll('input[name="payment_method"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', (e) => {
                this.togglePaymentMethod(e.target.value);
            });
        });
        
        // Validação de cartão de crédito
        const cardNumber = document.querySelector('input[name="card_number"]');
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                this.detectCardType(e.target.value);
            });
        }
    }
    
    // Toggle método de pagamento
    togglePaymentMethod(method) {
        const sections = document.querySelectorAll('.payment-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        const activeSection = document.getElementById(`${method}-section`);
        if (activeSection) {
            activeSection.style.display = 'block';
        }
    }
    
    // Detectar tipo do cartão
    detectCardType(cardNumber) {
        const number = cardNumber.replace(/\D/g, '');
        let cardType = 'unknown';
        
        if (number.match(/^4/)) {
            cardType = 'visa';
        } else if (number.match(/^5[1-5]/) || number.match(/^2[2-7]/)) {
            cardType = 'mastercard';
        } else if (number.match(/^3[47]/)) {
            cardType = 'amex';
        } else if (number.match(/^6/)) {
            cardType = 'discover';
        }
        
        // Atualizar ícone do cartão
        const cardIcon = document.querySelector('.card-icon');
        if (cardIcon) {
            cardIcon.className = `card-icon ${cardType}`;
        }
    }
    
    // Validar CPF
    validateCPF(cpf) {
        if (cpf.length !== 11) return false;
        
        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        // Validar dígitos verificadores
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(9))) return false;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(10))) return false;
        
        return true;
    }
    
    // Resetar formulário
    resetForm(formId) {
        const formData = this.forms.get(formId);
        if (formData) {
            formData.element.reset();
            formData.fields.forEach((fieldData) => {
                this.clearFieldErrors(fieldData.element);
                fieldData.isValid = false;
                fieldData.errors = [];
            });
            this.updateFormStatus(formId);
        }
    }
}

// Inicializar gerenciador de formulários
document.addEventListener('DOMContentLoaded', function() {
    window.formManager = new FormManager();
});

// Funções auxiliares
function validateForm(formId) {
    if (window.formManager) {
        const formData = window.formManager.forms.get(formId);
        if (formData) {
            return formData.isValid;
        }
    }
    return false;
}

function resetForm(formId) {
    if (window.formManager) {
        window.formManager.resetForm(formId);
    }
}