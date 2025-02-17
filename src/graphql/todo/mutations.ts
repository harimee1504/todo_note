import { gql } from "@apollo/client";

export const CREATE_TODO = gql`
  mutation CreateTodo($input: TodoCreate!) {
    createTodo(input: $input) {
      id
      todo
      description
      createdBy {
        id
        firstName
        lastName
        email
        imageUrl
      }
      isPrivate
      dueDate
      org_id
      status
      createdAt
      updatedAt
      assignedTo {
        id
        firstName
        lastName
        email
        imageUrl
      }
      mentions {
        id
        firstName
        lastName
        email
        imageUrl
      }
      tags {
        id
        tag
      }
    }
  }
`;

export const UPDATE_TODO = gql`
  mutation UpdateTodo($input: TodoUpdate!) {
    updateTodo(input: $input) {
      id
      todo
      description
      createdBy {
        id
        firstName
        lastName
        email
        imageUrl
      }
      isPrivate
      dueDate
      org_id
      status
      createdAt
      updatedAt
      assignedTo {
        id
        firstName
        lastName
        email
        imageUrl
      }
      mentions {
        id
        firstName
        lastName
        email
        imageUrl
      }
      tags {
        id
        tag
      }
    }
  }
`;

export const UPDATE_TODO_STATUS = gql`
  mutation UpdateTodoStatus($input: TodoUpdateStatus!) {
    updateTodoStatus(input: $input) {
      updated
    }
  }
`;

export const DELETE_TODO = gql`
  mutation DeleteTodo($input: TodoDelete!) {
    deleteTodo(input: $input) {
      deleted
    }
  }
`;
