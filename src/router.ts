import { Router } from "express";
import { body } from "express-validator";
import { createAccount, getUser, login } from "./handlers";
import { handleinputErrors } from "./middleware/validation";

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

router.get("/user", getUser);

export default router;
