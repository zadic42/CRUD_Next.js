import { gql } from '@apollo/client';

export const ADD_EMPLOYEE = gql`
  mutation AddUser($name: String!, $email: String!, $position: String!) {
    addUser(name: $name, email: $email, position: $position) {
      id
      name
      email
      position
    }
  }
`;

export const DELETE_EMPLOYEE = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
      name
    }
  }
`;

export const UPDATE_EMPLOYEE = gql`
  mutation UpdateUser($id: ID!, $name: String, $email: String, $position: String) {
    updateUser(id: $id, name: $name, email: $email, position: $position) {
      id
      name
      email
      position
    }
  }
`;
