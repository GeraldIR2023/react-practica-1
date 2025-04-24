import { body } from "express-validator";
import { Router } from "express";
import { authenticate } from "./middleware/auth";
import { handleinputErrors } from "./middleware/validation";
import {
    createAccount,
    getUser,
    getUserByHandle,
    login,
    updateProfile,
    uploadImage,
} from "./handlers";

const router = Router();

/** Autenticación y Registro */
router.post(
    "/auth/register",
    body("handle").notEmpty().withMessage("El Handle no puede ir vacio"),
    body("name").notEmpty().withMessage("El Nombre no puede ir vacio"),
    body("email").isEmail().withMessage("El E-mail no puede ir vacio"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("El Password es muy corto, mínimo 8 caracteres"),
    handleinputErrors,
    createAccount
);

router.post(
    "/auth/login",
    body("email").isEmail().withMessage("El E-mail no puede ir vacio"),
    body("password").notEmpty().withMessage("El Password es obligatorio"),
    handleinputErrors,
    login
);

router.get("/user", authenticate, getUser);

router.patch(
    "/user",
    body("handle").notEmpty().withMessage("El Handle no puede ir vacio"),
    body("description")
        .notEmpty()
        .withMessage("La descripción no puede ir vacia"),
    handleinputErrors,
    authenticate,
    updateProfile
);

router.post("/user/image", authenticate, uploadImage);

router.get("/:handle", getUserByHandle); //*Indica que la ruta es dinámica y que el handle es un parámetro

export default router;
