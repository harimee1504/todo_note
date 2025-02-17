import { gql } from '@apollo/client';

export const GET_TODO = gql`
  query GetTodo($input: TodoFilter) {
    getTodo(input: $input) {
    id
    todo
    description
    isPrivate
    dueDate
    org_id
    status
    createdAt
    updatedAt
    createdBy {
        id
        firstName
        lastName
        email
        imageUrl
    }
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
    comments {
        id
        comment
        mentions {
            id
            firstName
            lastName
            email
            imageUrl
        }
        todo_id
        org_id
        createdBy{
        id
        firstName
        lastName
        email
        imageUrl
    }
        updatedBy{
        id
        firstName
        lastName
        email
        imageUrl
    }
        createdAt
        updatedAt
    }
    tags {
        id
        tag
    } 
  }
  }
`;