import { gql } from '@apollo/client';

export const CREATE_NOTE = gql`
  mutation CreateNote($input: NoteCreate!) {
    createNote(input: $input) {
      id
      title
      note
      createdBy {
        id
        firstName
        lastName
        email
        imageUrl
      }
      updatedBy {
        id
        firstName
        lastName
        email
        imageUrl
      }
      org_id
      startTime
      endTime
      createdAt
      updatedAt
      attendees {
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
      }
      tags {
        id
        tag
      }
    }
  }
`;

export const UPDATE_NOTE = gql`
  mutation UpdateNote($input: NoteUpdate!) {
    updateNote(input: $input) {
      id
      title
      note
      createdBy {
        id
        firstName
        lastName
        email
        imageUrl
      }
      updatedBy {
        id
        firstName
        lastName
        email
        imageUrl
      }
      org_id
      startTime
      endTime
      createdAt
      updatedAt
      attendees {
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
      }
      tags {
        id
        tag
      }
    }
  }
`;

export const DELETE_NOTE = gql`
  mutation DeleteNote($input: NoteDelete!) {
    deleteNote(input: $input) {
      deleted
    }
  }
`; 