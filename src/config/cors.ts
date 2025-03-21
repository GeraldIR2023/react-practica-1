import { CorsOptions } from "cors";
console.log(process.argv);

export const corsConfig: CorsOptions = {
    origin: function (origin, callback) {
        const whiteList = [process.env.FRONTEND_URL];

        if (process.argv[2] === "--api") {
            whiteList.push(undefined);
        }

        if (whiteList.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Error de CORS"));
        }
    },
};
//^ Configuración de CORS para permitir solo el acceso desde el frontend
