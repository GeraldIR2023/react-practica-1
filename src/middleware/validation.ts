import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const handleinputErrors = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    //^Manejar errores
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next(); //*Si no hay errores, continuar
};
