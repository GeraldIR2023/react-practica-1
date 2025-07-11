import slug from "slug";
import User from "../models/User";
import formidable from "formidable";
import cloudinary from "../config/cloudinary";
import { v4 as uuid } from "uuid";
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
    res.status(200).json(req.user); //*Retornamos el usuario
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { description, links } = req.body;

        const handle = slug(req.body.handle, "");
        const handleExist = await User.findOne({ handle });
        if (handleExist && handleExist.email !== req.user.email) {
            const error = new Error("Nombre de usuario no disponible");
            res.status(409).json({ error: error.message });
            return;
        } //^Verificamos si el handle ya existe y si no es el mismo usuario

        //*Actualizamos el usuario
        req.user.description = description;
        req.user.handle = handle;
        req.user.links = links;
        await req.user.save();
        res.send("Perfil actualizado correctamente"); //*Retornamos el usuario actualizado
    } catch (e) {
        const error = new Error("Hubo un error al actualizar el perfil");
        res.status(500).json({ error: error.message });
    }
};

export const uploadImage = async (req: Request, res: Response) => {
    const form = formidable({ multiples: false });
    try {
        form.parse(req, (error, fields, fiels) => {
            console.log(fiels.file[0].filepath);

            cloudinary.uploader.upload(
                fiels.file[0].filepath,
                { public_id: uuid() },
                async function (error, result) {
                    if (error) {
                        const error = new Error(
                            "Hubo un error al subir la imagen"
                        );
                        res.status(500).json({ error: error.message });
                        return;
                    }
                    if (result) {
                        req.user.image = result.secure_url; //*Guardamos la imagen en el usuario
                        await req.user.save();
                        res.json({ image: result.secure_url });
                    }
                }
            );
        });
    } catch (e) {
        const error = new Error("Hubo un error");
        res.status(500).json({ error: error.message });
    }
};

export const getUserByHandle = async (req: Request, res: Response) => {
    try {
        const { handle } = req.params; //^Obtenemos el handle de la url
        const user = await User.findOne({ handle }).select(
            "-_id -__v -email -password"
        );

        if (!user) {
            const error = new Error("El usuario no existe");
            res.status(404).json({ error: error.message });
            return;
        }

        res.json(user);
    } catch (e) {
        const error = new Error("Hubo un error");
        res.status(500).json({ error: error.message });
    }
};

export const searchByHandle = async (req: Request, res: Response) => {
    try {
        const { handle } = req.body;
        const userExists = await User.findOne({ handle });

        if (userExists) {
            const error = new Error(`${handle} ya está registrado`);
            res.status(409).json({ error: error.message });
            return;
        }
        res.send(`${handle} está disponible`);
    } catch (e) {
        const error = new Error("Hubo un error");
        res.status(500).json({ error: error.message });
    }
};
