import slug from "slug";
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

    generateJWT(user); //*Generamos el token
    res.status(200).send("Usuario logueado");
};
