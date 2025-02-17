import { gql } from "@apollo/client";

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
