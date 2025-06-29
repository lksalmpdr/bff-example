import cors from "cors";
import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

//Endpoint BFF para dados do usuário
app.get("/api/user", async (req, res) => {
    try {
        //Usando um serviço placeholder
        const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
        const userData = await response.json();

        //adaptar para o formato esperado pelo frontend
        const adaptedData = {
            name: userData.name,
            email: userData.email,
            company: userData.company.name,
        };

        res.json(adaptedData);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar dados do usuário" });
    }
});

app.listen(PORT, () => {
    console.log(`BFF rodando em  http://localhost:${PORT}`);
});