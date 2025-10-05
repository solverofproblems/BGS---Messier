function verificarUsuario() {

    const email_admin = document.getElementById('email-admin').value;
    const password_admin = document.getElementById('password-admin').value;

    if ([email_admin, password_admin].every(i => typeof i === "string" && i.trim() !== "")) {


        axios({
            method: 'get',
            url: 'http://localhost:3000/confirmarUser',
            params: {
                email_usuario: email_admin,
                senha_usuario: password_admin
            }
        })
            .then(function (response) {
                console.log(response.data)
            });



    } else {
        console.log('info faltando.')
    }


}