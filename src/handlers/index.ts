import slug from "slug";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { generateJWT } from "../utils/jwt";
import { Request, Response } from "express";
import { checkPassword, hashPassword } from "../utils/auth";

export const createAccount = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email }); //*Buscamos si el usuario ya existe en la base de datos
    if (userExists) {
        const error = new Error("Un usuario con este correo ya existe");
        res.status(401).json({ error: error.message });
        return;
    }

    const handle = slug(req.body.handle, "");
    const handleExist = await User.findOne({ handle }); //*Buscamos si el handle ya existe en la base de datos
    if (handleExist) {
        const error = new Error("Nombre de usuario no disponible");
        res.status(409).json({ error: error.message });
        return;
    }

    const user = new User(req.body);
    user.password = await hashPassword(password); //*Hasheamos la contraseña
    user.handle = handle;

    await user.save();
    res.status(201).send("Usuario creado");
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    //^Revisar si el usuario ya está registrado
    const user = await User.findOne({ email });
    if (!user) {
        const error = new Error("El usuario no existe");
        res.status(404).json({ error: error.message });
        return;
    }

    //^Comparar el password
    const isPasswordCorrect = await checkPassword(password, user.password);
    if (!isPasswordCorrect) {
        const error = new Error("Contraseña incorrecta");
        res.status(401).json({ error: error.message });
        return;
    }

    const token = generateJWT({ id: user._id }); //*Generamos el token

    res.status(200).send(token);
};

export const getUser = async (req: Request, res: Response) => {
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
            res.status(200).json(user); //^Devolvemos el usuario
        }
    } catch (error) {
        res.status(500).json({ error: "Token no valido" });
    }
};
