import { MensajeSchema } from "../db/schema.ts";

export const Vendedor = {
    id: (parent: MensajeSchema): string => parent._id.toString(),
  
}