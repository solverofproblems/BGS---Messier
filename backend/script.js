import { createClient } from '@supabase/supabase-js';
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Função para executar operações do Supabase com retry
async function executeWithRetry(operation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries} - Executando operação...`);
      const result = await operation();
      console.log(`✅ Operação bem-sucedida na tentativa ${attempt}`);
      return result;
    } catch (error) {
      console.error(`❌ Tentativa ${attempt} falhou:`, error.message);
      
      if (attempt === maxRetries) {
        console.error(`💥 Todas as ${maxRetries} tentativas falharam`);
        throw error;
      }
      
      // Aguarda antes da próxima tentativa (backoff exponencial)
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

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
    console.log("📨 Requisição POST recebida em /criarContatos");
    const contatoNovo = req.body;
    const emailVerificacao = contatoNovo.email_contact;
    const numeroVerificacao = contatoNovo.telef_contact;
    const linkedInVerificacao = contatoNovo.linkedin_contact;
    
    console.log("📋 Dados recebidos:", contatoNovo);
    console.log("📧 Email para verificação:", emailVerificacao);
    console.log("📱 Telefone para verificação:", numeroVerificacao);
    console.log("💼 LinkedIn para verificação:", linkedInVerificacao);

    // 1️⃣ Verifica se o e-mail já existe (com retry)
    const emailCheckResult = await executeWithRetry(async () => {
      const { data, error } = await supabase
        .from("new_contacts")
        .select("*")
        .eq("email_contact", emailVerificacao);
      
      if (error) {
        throw new Error(`Erro ao verificar e-mail: ${error.message}`);
      }
      return data;
    });

    // 2️⃣ Verifica se o telefone já existe (com retry)
    const phoneCheckResult = await executeWithRetry(async () => {
      const { data, error } = await supabase
        .from("new_contacts")
        .select("*")
        .eq("telef_contact", numeroVerificacao);
      
      if (error) {
        throw new Error(`Erro ao verificar telefone: ${error.message}`);
      }
      return data;
    });

    // 3️⃣ Verifica se o LinkedIn já existe (com retry) - APENAS se preenchido
    let linkedinCheckResult = null;
    if (linkedInVerificacao && linkedInVerificacao.trim() !== "") {
      linkedinCheckResult = await executeWithRetry(async () => {
        const { data, error } = await supabase
          .from("new_contacts")
          .select("*")
          .eq("linkedin_contact", linkedInVerificacao);
        
        if (error) {
          throw new Error(`Erro ao verificar LinkedIn: ${error.message}`);
        }
        return data;
      });
    }

    // 4️⃣ Verifica qual campo já existe e retorna mensagem específica
    if (emailCheckResult && emailCheckResult.length > 0) {
      console.log("❌ E-mail já existe:", emailCheckResult[0]);
      return res.status(400).json({ 
        message: "E-mail já registrado!",
        field: "email",
        details: "Este e-mail já está cadastrado no sistema."
      });
    }

    if (phoneCheckResult && phoneCheckResult.length > 0) {
      console.log("❌ Telefone já existe:", phoneCheckResult[0]);
      return res.status(400).json({ 
        message: "Telefone já registrado!",
        field: "phone",
        details: "Este número de telefone já está cadastrado no sistema."
      });
    }

    if (linkedinCheckResult && linkedinCheckResult.length > 0) {
      console.log("❌ LinkedIn já existe:", linkedinCheckResult[0]);
      return res.status(400).json({ 
        message: "LinkedIn já registrado!",
        field: "linkedin",
        details: "Este perfil do LinkedIn já está cadastrado no sistema."
      });
    }

    console.log("✅ Nenhum conflito encontrado, prosseguindo com o cadastro...");

    // 4️⃣ Se não há conflitos, prossegue com o cadastro (com retry)
    const insertResult = await executeWithRetry(async () => {
      const { data, error } = await supabase
        .from('new_contacts')
        .insert([contatoNovo])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao inserir usuário: ${error.message}`);
      }
      return data;
    });

    console.log('🎉 Usuário cadastrado com sucesso:', insertResult);
    res.status(201).json({message: 'Usuário cadastrado com sucesso!', user: insertResult});

  } catch (err) {
    console.error("💥 Erro interno:", err);
    
    // Diferencia entre erros de conectividade e outros erros
    if (err.message.includes('fetch failed') || err.message.includes('network') || err.message.includes('connection')) {
      res.status(503).json({ 
        error: "Serviço temporariamente indisponível. Tente novamente em alguns instantes.",
        type: "connection_error"
      });
    } else {
      res.status(500).json({ 
        error: "Erro interno no servidor. Tente novamente.",
        type: "server_error"
      });
    }
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