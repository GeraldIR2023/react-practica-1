import "dotenv/config";
import cors from "cors";
import router from "./router";
import express from "express"; //ESM Ecmascript modules
import { connectDB } from "./config/db";
import { corsConfig } from "./config/cors";

connectDB(); //*Conectamos a la base de datos

const app = express(); //^ Instancia del servidor

//^Configuración de CORS
app.use(cors(corsConfig));

//^Leer datos de formularios
app.use(express.json());

app.use("/", router); //*Cuando hacemos una petición a la URL principal, ejecuta el router y entra y mapea los metodos que tenga

export default app;
