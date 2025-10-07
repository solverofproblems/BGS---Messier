const usuarioLogado = JSON.parse(sessionStorage.getItem('user'));
console.log(usuarioLogado);


function criarContatos() {

    const nomeContato = document.getElementById('name_content').value;
    const emailContato = document.getElementById('email_content').value;
    const telefContato = document.getElementById('telef_content').value;
    const empresaContato = document.getElementById('empresa_content').value;
    const linkedinContato = document.getElementById('linkedin_content').value;

    if ([nomeContato, emailContato, telefContato].every(i => typeof i === "string" && i.trim() !== "")) {
        console.log('Tudo certo por aqui!!')


        axios.post('http://localhost:3000/criarContatos', {
            name_contact: nomeContato,
            email_contact: emailContato,
            telef_contact: telefContato,
            empresa_contact: empresaContato,
            linkedin_contact: linkedinContato,
            id_admin : usuarioLogado.id
        })
            .then(function (response) {
                console.log(response.data);
            })
            .catch(function (error) {
                console.log(error);
            });




    } else {
        console.log('Informações faltando.')
    }


}



