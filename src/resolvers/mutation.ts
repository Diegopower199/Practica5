import { ObjectId } from "mongo";
import * as bcrypt from "bcrypt";
import { createJWT, verifyJWT } from "../lib/jwt.ts";
import { MensajeSchema, UsuarioSchema } from "../db/schema.ts";
import { MensajesCollection, UsuarioCollection } from "../db/dbconnection.ts";
import { Context, Mensaje, Usuario } from "../types.ts";

export const Mutation = {
  login: async (_: unknown, args: { username: string; password: string },): Promise<string> => {
    try {
      const user: UsuarioSchema | undefined = await UsuarioCollection.findOne({
        username: args.username,
      });

      if (!user) {
        throw new Error("User does not exist");
      }

      let validPassword: boolean;

      if (user.password) {
        validPassword = await bcrypt.compare(args.password, user.password);
      } else {
        validPassword = false;
      }

      if (!validPassword) {
        throw new Error("Invalid password");
      }

      const token = await createJWT(
        {
          username: user.username,
          id: user._id.toString(),
          fechaCreacion: user.fechaCreacion,
          idioma: user.idioma,
        },
        Deno.env.get("JWT_SECRET")!,
      );
      return token;
    } catch (e) {
      throw new Error(e);
    }
  },

  createUser: async (_: unknown, args: { username: string; password: string }, ctx: Context,): Promise<UsuarioSchema> => {
    try {
      const usuarioUsernameEncontrado = await UsuarioCollection.findOne({
        username: args.username,
      });

      if (usuarioUsernameEncontrado) {
        throw new Error(
          "No puedes crear un usuario con este usuario, ya existe",
        );
      }

      const passwordEncriptada = await bcrypt.hash(args.password);

      const fecha = new Date();
      const idioma = ctx.lang || "es";

      const id = await UsuarioCollection.insertOne({
        username: args.username,
        password: passwordEncriptada,
        fechaCreacion: fecha,
        idioma: idioma,
      });

      return {
        _id: id,
        username: args.username,
        fechaCreacion: fecha,
        idioma: idioma,
      };
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  },

  deleteUser: async (_: unknown, args: {}, ctx: Context,): Promise<UsuarioSchema> => {
    try {
      if (ctx.token === null) {
        throw new Error("Error, este usuario no esta autentificado");
      }
      const payload = await verifyJWT(
        ctx.token || "",
        Deno.env.get("JWT_SECRET")!,
      );

      const user: Usuario = payload as Usuario;

      const encontrarUsuario: UsuarioSchema | undefined =
        await UsuarioCollection.findOne({
          _id: new ObjectId(user.id),
        });

      if (!encontrarUsuario) {
        throw new Error("User does not exist");
      }

      return {
        _id: encontrarUsuario?._id,
        username: encontrarUsuario?.username,
        fechaCreacion: encontrarUsuario?.fechaCreacion,
        idioma: encontrarUsuario?.idioma,
      };
    } catch (e) {
      throw new Error(e);
    }
  },

  sendMessage: async (_: unknown, args: { destinatario: string; menssage: string }, ctx: Context,): Promise<MensajeSchema> => {
    try {
      if (ctx.token === null) {
        throw new Error("Error, este usuario no esta autenticado");
      }

      if (ctx.lang === null) {
        throw new Error("Error, no se autentifica el idioma");
      }

      const payload = await verifyJWT(
        ctx.token || "",
        Deno.env.get("JWT_SECRET")!,
      );

      const userEmisor: Usuario = payload as Usuario;

      const encontrarUsuarioEmisor: UsuarioSchema | undefined =
        await UsuarioCollection.findOne({
          _id: new ObjectId(userEmisor.id),
        });

      if (!encontrarUsuarioEmisor) {
        throw new Error("User does not exist");
      }

      if (ctx.lang !== encontrarUsuarioEmisor.idioma) {
        throw new Error(
          "Error, el idioma no es el mismo en el Auth que el del emisor",
        );
      }

      const encontrarUsuarioReceptor: UsuarioSchema | undefined =
        await UsuarioCollection.findOne({
          _id: new ObjectId(args.destinatario),
        });

      if (!encontrarUsuarioReceptor) {
        throw new Error("User does not exist");
      }

      const fechaCreacion = new Date();

      const id = await MensajesCollection.insertOne({
        emisor: encontrarUsuarioEmisor._id.toString(),
        receptor: encontrarUsuarioReceptor._id.toString(),
        idioma: ctx.lang,
        fechaCreacionMensaje: fechaCreacion,
        contenido: args.menssage,
      });

      return {
        _id: id,
        emisor: encontrarUsuarioEmisor._id.toString(),
        receptor: args.destinatario,
        idioma: ctx.lang,
        fechaCreacionMensaje: fechaCreacion,
        contenido: args.menssage,
      };
    } catch (e) {
      throw new Error(e);
    }
  },
};
