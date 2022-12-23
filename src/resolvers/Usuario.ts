import { UsuarioSchema } from "../db/schema.ts";
export const Vendedor = {
    id: (parent: UsuarioSchema): string => parent._id.toString(),
  
}