import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10); //*Generamos un salt para hashear la contraseña
    return await bcrypt.hash(password, salt); //*Hasheamos la contraseña
};

export const checkPassword = async (enteredpassword: string, hash: string) => {
    return await bcrypt.compare(enteredpassword, hash); //*Comparamos la contraseña ingresada con la hasheada
};
