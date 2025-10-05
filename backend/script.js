import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { supabase } from './supabaseClient.js';
import { createClient } from '@supabase/supabase-js'


export const base = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);


dotenv.config();
const app = express();

app.use(cors());

app.get('/confirmarUser', (req, res) => {

    async function getUsers() {

        // console.log(req.query.email_usuario);
        // console.log(req.query.senha_usuario);
        // Requisição GET usando o Supabase
        const { data, error } = await supabase
            .from('admin_table')  // nome da tabela
            .select("admin_id, admin_name")
            .eq('admin_email', req.query.email_usuario)
            .eq('admin_password', req.query.senha_usuario)  // pega todas as colunas

        if (error) {
            console.error('Erro ao buscar usuários:', error);
        } else {

            if (data[0]){
            console.log(data[0].admin_name)
            } else {
                console.log('Não tem nenhum registro!')
            }
        }
    }

    // Chama a função
    getUsers();
})

app.listen(3000);