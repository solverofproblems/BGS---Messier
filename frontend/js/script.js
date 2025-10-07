// Sistema de Notificações Elegantes
function showNotification(message, type = 'error', duration = 4000) {
    // Remove notificações existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Cria nova notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'error' ? '⚠' : type === 'success' ? '✓' : '!';
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
    const loginButton = document.getElementById('login-button');
    
    loadingOverlay.classList.add('show');
    loginButton.classList.add('loading');
    loginButton.disabled = true;
    loginButton.textContent = 'Verificando...';
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loginButton = document.getElementById('login-button');
    
    loadingOverlay.classList.remove('show');
    loginButton.classList.remove('loading');
    loginButton.disabled = false;
    loginButton.textContent = 'Verificar';
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

// Função principal de verificação de usuário
function verificarUsuario() {
    const nameField = document.getElementById('name-admin');
    const passwordField = document.getElementById('password-admin');
    const name_admin = nameField.value.trim();
    const password_admin = passwordField.value.trim();

    // Validação dos campos
    const isNameValid = name_admin !== "";
    const isPasswordValid = password_admin !== "";

    // Feedback visual para campos inválidos
    validateField(nameField, isNameValid);
    validateField(passwordField, isPasswordValid);

    if (!isNameValid || !isPasswordValid) {
        showNotification("Por favor, preencha todos os campos!", 'warning');
        return;
    }

    // Mostra tela de carregamento
    showLoading();

    // Faz a requisição
    axios({
        method: 'get',
        url: 'http://localhost:3000/confirmarUser',
        params: {
            nome_usuario: name_admin,
            senha_usuario: password_admin
        }
    })
    .then(function (response) {
        hideLoading();
        const valoresRecebidos = response.data;

        if (valoresRecebidos !== "Nome ou senha errados!") {
            // Sucesso - salva dados e redireciona
            sessionStorage.setItem('user', JSON.stringify({
                id: valoresRecebidos.admin_id,
                nome: valoresRecebidos.admin_name
            }));

            showNotification("Login realizado com sucesso! Redirecionando...", 'success', 2000);
            
            // Redireciona após mostrar a notificação de sucesso
            setTimeout(() => {
                window.location.href = "../html/registrar_users.html";
            }, 2000);

        } else {
            // Erro de credenciais
            showNotification("Nome de usuário ou senha incorretos!", 'error');
        }
    })
    .catch(function (error) {
        hideLoading();
        console.error('Erro na requisição:', error);
        showNotification("Erro de conexão. Tente novamente!", 'error');
    });
}

// Adiciona eventos para melhorar a experiência do usuário
document.addEventListener('DOMContentLoaded', function() {
    const nameField = document.getElementById('name-admin');
    const passwordField = document.getElementById('password-admin');
    const loginButton = document.getElementById('login-button');

    // Permite login com Enter
    [nameField, passwordField].forEach(field => {
        field.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                verificarUsuario();
            }
        });
    });

    // Remove classes de erro quando o usuário começa a digitar
    [nameField, passwordField].forEach(field => {
        field.addEventListener('input', function() {
            this.classList.remove('error');
        });
    });

    // Adiciona efeito de foco suave
    [nameField, passwordField].forEach(field => {
        field.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.2s ease';
        });

        field.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
        });
    });
});