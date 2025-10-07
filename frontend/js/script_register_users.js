// Verifica se o usuário está logado
const usuarioLogado = JSON.parse(sessionStorage.getItem('user'));
if (!usuarioLogado) {
    window.location.href = "../html/index.html";
}
console.log(usuarioLogado);

// Sistema de Notificações Elegantes
function showNotification(message, type = 'error', duration = 4000) {
    // Remove notificações existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Cria nova notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    notification.innerHTML = `
        <div class="notification-text">${message}</div>
    `;

    document.body.appendChild(notification);

    // Anima a entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Remove automaticamente após a duração especificada
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 400);
    }, duration);
}

// Sistema de Carregamento
function showLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const submitButton = document.getElementById('submit-button');
    
    loadingOverlay.classList.add('show');
    submitButton.classList.add('loading');
    submitButton.disabled = true;
    submitButton.textContent = 'Registrando...';
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const submitButton = document.getElementById('submit-button');
    
    loadingOverlay.classList.remove('show');
    submitButton.classList.remove('loading');
    submitButton.disabled = false;
    submitButton.textContent = 'Enviar';
}

// Validação de campos com feedback visual
function validateField(field, isValid) {
    field.classList.remove('error', 'success');
    
    if (isValid) {
        field.classList.add('success');
    } else {
        field.classList.add('error');
    }
    
    // Remove classes após animação
    setTimeout(() => {
        field.classList.remove('error', 'success');
    }, 2000);
}

// Validação de email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validação de telefone (formato básico)
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\(\)\-\+]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Validação de LinkedIn (formato básico)
function isValidLinkedIn(linkedin) {
    // Aceita URLs do LinkedIn ou apenas o nome do usuário
    const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9\-]+\/?$|^[a-zA-Z0-9\-]+$/;
    return linkedinRegex.test(linkedin);
}

// Limpar campos após sucesso
function clearFields() {
    const fields = [
        'name_content',
        'email_content', 
        'telef_content',
        'empresa_content',
        'linkedin_content'
    ];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.value = '';
        field.classList.remove('error', 'success');
    });
}

// Função principal de criação de contatos
function criarContatos() {
    const nameField = document.getElementById('name_content');
    const emailField = document.getElementById('email_content');
    const phoneField = document.getElementById('telef_content');
    const companyField = document.getElementById('empresa_content');
    const linkedinField = document.getElementById('linkedin_content');

    const nomeContato = nameField.value.trim();
    const emailContato = emailField.value.trim();
    const telefContato = phoneField.value.trim();
    const empresaContato = companyField.value.trim();
    const linkedinContato = linkedinField.value.trim();

    // Validação dos campos obrigatórios
    const isNameValid = nomeContato !== "";
    const isEmailValid = emailContato !== "" && isValidEmail(emailContato);
    const isPhoneValid = telefContato !== "" && isValidPhone(telefContato);

    // Feedback visual para campos inválidos
    validateField(nameField, isNameValid);
    validateField(emailField, isEmailValid);
    validateField(phoneField, isPhoneValid);

    // Verifica se todos os campos obrigatórios estão preenchidos e válidos
    if (!isNameValid || !isEmailValid || !isPhoneValid) {
        let errorMessage = "Por favor, preencha corretamente: ";
        const errors = [];
        
        if (!isNameValid) errors.push("Nome");
        if (!isEmailValid) errors.push("E-mail válido");
        if (!isPhoneValid) errors.push("Telefone válido");
        
        errorMessage += errors.join(", ");
        showNotification(errorMessage, 'warning');
        return;
    }

    // Mostra tela de carregamento
    showLoading();

    // Faz a requisição
        axios.post('http://localhost:3000/criarContatos', {
            name_contact: nomeContato,
            email_contact: emailContato,
            telef_contact: telefContato,
            empresa_contact: empresaContato,
            linkedin_contact: linkedinContato,
        id_admin: usuarioLogado.id
        })
            .then(function (response) {
        hideLoading();
        console.log('✅ Resposta do servidor:', response.data);
        console.log('📊 Status da resposta:', response.status);
        
        // Verifica se o registro foi bem-sucedido
        if (response.data.message === "Usuário cadastrado com sucesso!") {
            console.log('🎉 Cadastro realizado com sucesso!');
            showNotification("Contato registrado com sucesso! 🎉", 'success', 3000);
            
            // Limpa os campos APENAS se o registro foi bem-sucedido
            setTimeout(() => {
                clearFields();
            }, 1000);
            
        } else if (response.data.message === "E-mail já registrado!") {
            console.log('❌ E-mail já existe no sistema');
            showNotification("Este e-mail já está cadastrado no sistema! Por favor, use um e-mail diferente.", 'error');
            // Destaca o campo de e-mail para indicar o problema
            const emailField = document.getElementById('email_content');
            validateField(emailField, false);
        } else if (response.data.message === "Telefone já registrado!") {
            console.log('❌ Telefone já existe no sistema');
            showNotification("Este número de telefone já está cadastrado no sistema! Por favor, use um número diferente.", 'error');
            // Destaca o campo de telefone para indicar o problema
            const phoneField = document.getElementById('telef_content');
            validateField(phoneField, false);
        } else if (response.data.message === "LinkedIn já registrado!") {
            console.log('❌ LinkedIn já existe no sistema');
            showNotification("Este perfil do LinkedIn já está cadastrado no sistema! Por favor, use um perfil diferente.", 'error');
            // Destaca o campo de LinkedIn para indicar o problema
            const linkedinField = document.getElementById('linkedin_content');
            validateField(linkedinField, false);
        } else {
            console.log('⚠️ Resposta inesperada:', response.data);
            showNotification("Erro inesperado. Tente novamente!", 'error');
        }
            })
            .catch(function (error) {
        hideLoading();
        console.error('❌ Erro na requisição:', error);
        
        if (error.response) {
            // Erro com resposta do servidor
            const status = error.response.status;
            const data = error.response.data;
            
            console.log('📊 Status do erro:', status);
            console.log('📋 Dados do erro:', data);
            
            if (status === 400) {
                if (data.message === "E-mail já registrado!") {
                    console.log('❌ E-mail já existe (via catch)');
                    showNotification("Este e-mail já está cadastrado no sistema! Por favor, use um e-mail diferente.", 'error');
                    // Destaca o campo de e-mail para indicar o problema
                    const emailField = document.getElementById('email_content');
                    validateField(emailField, false);
                } else if (data.message === "Telefone já registrado!") {
                    console.log('❌ Telefone já existe (via catch)');
                    showNotification("Este número de telefone já está cadastrado no sistema! Por favor, use um número diferente.", 'error');
                    // Destaca o campo de telefone para indicar o problema
                    const phoneField = document.getElementById('telef_content');
                    validateField(phoneField, false);
                } else if (data.message === "LinkedIn já registrado!") {
                    console.log('❌ LinkedIn já existe (via catch)');
                    showNotification("Este perfil do LinkedIn já está cadastrado no sistema! Por favor, use um perfil diferente.", 'error');
                    // Destaca o campo de LinkedIn para indicar o problema
                    const linkedinField = document.getElementById('linkedin_content');
                    validateField(linkedinField, false);
                } else {
                    console.log('⚠️ Erro 400 não identificado:', data);
                    showNotification("Erro ao registrar contato. Tente novamente!", 'error');
                }
            } else if (status === 500) {
                console.log('💥 Erro interno do servidor');
                showNotification("Erro interno do servidor. Tente novamente!", 'error');
            } else if (status === 503) {
                console.log('🌐 Problema de conectividade');
                showNotification("Serviço temporariamente indisponível. Tente novamente em alguns instantes.", 'warning');
            } else {
                console.log('⚠️ Erro não tratado:', status, data);
                showNotification("Erro ao registrar contato. Tente novamente!", 'error');
            }
        } else if (error.request) {
            // Erro de rede/conexão
            showNotification("Erro de conexão. Verifique sua internet e tente novamente!", 'error');
        } else {
            // Outros erros
            showNotification("Erro inesperado. Tente novamente!", 'error');
        }
    });
}

// Adiciona eventos para melhorar a experiência do usuário
document.addEventListener('DOMContentLoaded', function() {
    const fields = [
        'name_content',
        'email_content', 
        'telef_content',
        'empresa_content',
        'linkedin_content'
    ];

    // Permite envio com Enter em qualquer campo
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                criarContatos();
            }
        });
    });

    // Remove classes de erro quando o usuário começa a digitar
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.addEventListener('input', function() {
            this.classList.remove('error');
        });
    });

    // Validação em tempo real para email
    const emailField = document.getElementById('email_content');
    emailField.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email !== "" && !isValidEmail(email)) {
            validateField(this, false);
            showNotification("Por favor, insira um e-mail válido!", 'warning', 2000);
        }
    });

    // Validação em tempo real para telefone
    const phoneField = document.getElementById('telef_content');
    phoneField.addEventListener('blur', function() {
        const phone = this.value.trim();
        if (phone !== "" && !isValidPhone(phone)) {
            validateField(this, false);
            showNotification("Por favor, insira um telefone válido!", 'warning', 2000);
        }
    });

    // Validação em tempo real para LinkedIn (opcional)
    const linkedinField = document.getElementById('linkedin_content');
    linkedinField.addEventListener('blur', function() {
        const linkedin = this.value.trim();
        if (linkedin !== "" && !isValidLinkedIn(linkedin)) {
            validateField(this, false);
            showNotification("Por favor, insira um perfil do LinkedIn válido!", 'warning', 2000);
        }
    });

    // Adiciona efeito de foco suave
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.2s ease';
        });

        field.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
        });
    });
});



