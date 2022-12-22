import { gql } from "graphql_tag";

export const typeDefs = gql`
type Usuario {
  id: ID!
  username: String!
  email: String!
  name: String!
  surname: String!
  token: String
}

type Mensaje {
  id: ID!
  emisor: String!
  receptor: String!
  idioma: String!
  fechaCreacionMensaje: String
  contenido: String!
}

type Query {
  getMessages(page: String!, perPage: String!): Mensaje!

}

type Mutation {
  createUser(username: String!, password: String!): Usuario!
  login(username: String!, password: String!): String!
  deleteUser: Usuario!
  sendMessage(destinatario: String!, menssage: String!): Mensaje!
}
`;