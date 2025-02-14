import express from "express"; //ESM Ecmascript modules
import "dotenv/config";
import router from "./router";
import { connectDB } from "./config/db";

const app = express(); //^ Instancia del servidor

connectDB(); //*Conectamos a la base de datos

//*Leer datos de formularios
app.use(express.json());

app.use("/", router); //*Cuando hacemos una petición a la URL principal, ejecuta el router y entra y mapea los metodos que tenga

export default app;
