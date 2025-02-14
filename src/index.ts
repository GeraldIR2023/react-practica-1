import colors from "colors";
import server from "./server";

const port = process.env.PORT || 4000; //^Si existe la variable de env PORT, la usa, sino usa 4000

server.listen(port, () => {
    console.log(
        colors.magenta.bold(`Servidor Funcionando en el puerto: ${port}`)
    );
}); //*Creamos el servidor
