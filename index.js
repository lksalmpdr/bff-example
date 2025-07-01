import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Simulando uma passkey JWT
const JWT_SECRET = "minha-chave-secreta";
const JWT_EXPIRATION = "1h";

//Middleware para verificar o JWT
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token não fornecido" });
    }
    const tokenValue = token.split(" ")[1];
    try {
        const decoded = jwt.verify(tokenValue, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido" });
    }
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

//Endpoint para gerar um token JWT
app.post("/api/token", (req, res) => {
    const { username } = req.body;
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    res.json({ token });
});

//Endpoint protegido por JWT
app.get("/api/protected", verifyToken, (req, res) => {
    res.json({ message: "Acesso permitido", user: req.user });
});

//Endpoint de login
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "123456") {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
        res.json({ token });
    } else {
        res.status(401).json({ error: "Credenciais inválidas" });
    }
});

//Endpoint que agrega dados do perfil do usuário
app.get("/api/profile", verifyToken, async(req, res) => {
    const user = req.user.id;
    try {
        const [userData, ordersData] = await Promise.all([
            fetch(`https://jsonplaceholder.typicode.com/users/${user}`).then(res => res.json()),
            fetch(`https://jsonplaceholder.typicode.com/orders?userId=${user}`).then(res => res.json()),
        ]);

        const profileData = {
            user: userData,
            orders: ordersData,
        };
        res.json(profileData);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar dados do usuário" });
    }
});

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
    console.log(`BFF rodando em backend em http://localhost:${PORT}`);
});