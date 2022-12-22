import { MensajesCollection } from "../db/dbconnection.ts";
import { MensajeSchema } from "../db/schema.ts";
import { Mensaje } from "../types.ts";
import { Context } from "../types.ts";


export const Query = {
    getMessages:  async (parent: unknown, args: { page: number; perPage: number }): Promise<Mensaje[]> => {
        if (args.page < 0) {
            throw new Error ("Error, la pagina no puede ser negativa");
        }

        if (args.perPage < 10 || args.perPage > 200) {
            throw new Error ("Error, el limite de pagina es de 10-200");
        }

        const mensajes: MensajeSchema[] | undefined = await MensajesCollection.find()
        .limit(args.perPage)
        .skip((args.page) * args.perPage)
        .toArray();

        if (!mensajes) {
            throw new Error ("Error, no existe mensajes");
        }

        return mensajes.map((mensaje: MensajeSchema) => ({
            id: mensaje.toString(),
            emisor: mensaje.emisor, 
            receptor: mensaje.receptor, 
            idioma: mensaje.idioma, 
            fechaCreacionMensaje: mensaje.fechaCreacionMensaje, 
            contenido: mensaje.contenido,
        }));
    },
}