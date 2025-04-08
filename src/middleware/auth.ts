import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { Request, Response, NextFunction } from "express";

declare global {
    namespace Express {
        interface Request {
            user?: IUser; //^Agregamos la propiedad user al request
        }
    }
} //^Agregamos la propiedad user al request

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const bearer = req.headers.authorization; //*Obtenemos el token del header
    if (!bearer) {
        const error = new Error("No Autorizado");
        res.status(401).json({ error: error.message });
        return;
    }

    const [, token] = bearer.split(" "); //^Desestructuramos el token del header

    if (!token) {
        const error = new Error("No Autorizado");
        res.status(401).json({ error: error.message });
        return;
    }

    try {
        const result = jwt.verify(token, process.env.JWT_SECRET); //^Verificamos el token
        if (typeof result === "object" && result.id) {
            const user = await User.findById(result.id).select("-password"); //^Buscamos el usuario en la base de datos y excluimos la contraseña
            if (!user) {
                const error = new Error("Usuario no encontrado");
                res.status(404).json({ error: error.message });
                return;
            }
            req.user = user; //^Agregamos el usuario al request
            next(); //^Si el usuario existe, continuamos con la siguiente función
        }
    } catch (error) {
        res.status(500).json({ error: "Token no valido" });
    }
};
