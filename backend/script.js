import { createClient } from '@supabase/supabase-js';
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const app = express();

app.use(bodyParser.json());

app.use(cors());


app.get('/confirmarUser', (req, res) => {

    async function getUsers() {

        // console.log(req.query.email_usuario);
        // console.log(req.query.senha_usuario);
        // Requisição GET usando o Supabase

            // 1️⃣ Verifica se o e-mail já existe


        const { data, error } = await supabase
            .from('admin_table')  // nome da tabela
            .select("admin_id, admin_name")
            .eq('admin_name', req.query.nome_usuario)
            .eq('admin_password', req.query.senha_usuario) 

        if (error) {
            console.error('Erro ao buscar usuários:', error);
        } else {

            if (data[0]){

                res.send(data[0])
                console.log(data[0])

            } else {
                console.log('Não tem nenhum registro!')
                res.send('Nome ou senha errados!')
            }
        }
    }

    // Chama a função
    getUsers();
});



/*Inserir novos usuários e garantir que eles serão referenciados por uma FK:*/


// Rota para cadastrar novo usuário
app.post("/criarContatos", async (req, res) => {
  try {
    console.log("Requisição POST recebida em /criarContatos");
    const contatoNovo = req.body;
    const emailVerificacao = contatoNovo.email_contact;
    
    console.log("Dados recebidos:", contatoNovo);
    console.log("Email para verificação:", emailVerificacao);

    // 1️⃣ Verifica se o e-mail já existe
    const { data: existingUsers, error: selectError } = await supabase
      .from("new_contacts")
      .select("*")
      .eq("email_contact", emailVerificacao);

    if (selectError) {
      console.error("Erro ao verificar usuário existente:", selectError);
      return res.status(500).json({ error: "Erro ao verificar usuário." });
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log("Usuário já existe:", existingUsers[0]);
      return res.send('Usuário já registrado!')
    } else {
      const {data: newUser, error: insertError} = await supabase
      .from('new_contacts')
      .insert([contatoNovo])
      .select()
      .single();

      if (insertError) {
        console.error('Erro ao inserir usuário: ', insertError);
        return res.status(500).json({error: insertError.message});
      }

      console.log('Usuário cadastrado com sucesso:', newUser);

      res.status(201).json({message: 'Usuário cadastrado com sucesso!', user: newUser});


    }

  } catch (err) {
    console.error("Erro interno:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});




// Rota de fallback para requisições não encontradas
app.use((req, res) => {
  console.log(`Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: "Rota não encontrada", 
    method: req.method, 
    url: req.originalUrl,
    availableRoutes: ["GET /confirmarUser", "POST /criarContatos"]
  });
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
  console.log("Rotas disponíveis:");
  console.log("- GET /confirmarUser");
  console.log("- POST /criarContatos");
});