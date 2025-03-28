export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
}

export interface Tag {
  id: string;
  tag: string;
}

export interface Note {
  id: string;
  title: string;
  note: string;
  createdBy: User;
  updatedBy: User;
  org_id: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  attendees: User[];
  mentions: User[];
  comments: any[];
  tags: Tag[];
}

export interface NoteCreate {
  title: string;
  note: string;
  mentions?: string[];
  startTime: Date;
  endTime: Date;
  attendees: string[];
  tags?: string[];
}

export interface NoteUpdate {
  id: string;
  title: string;
  note: string;
  mentions?: string[];
  startTime: Date;
  endTime: Date;
  attendees: string[];
  tags?: string[];
}

export interface NoteDelete {
  id: string;
}

export interface NotesFilterOptions {
  title?: string;
  note?: string;
  createdBy?: string;
  updatedBy?: string;
  startTime?: Date;
  endTime?: Date;
  attendees?: string[];
  mentions?: string[];
  tags?: string[];
}

export interface NotesFilter {
  by: string;
  options?: NotesFilterOptions;
} 