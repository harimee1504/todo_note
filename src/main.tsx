import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";
import App from './App.tsx'
import TodoComponment from './pages/todo/index.tsx';
import NotesComponent from './pages/notes/page.tsx';

const router = createBrowserRouter([
  {
    path: "/todo",
    element: <App option='withWrapper'>
      <TodoComponment />
    </App>
  },
  {
    path: "/note",
    element: <App option='withWrapper'>
      <NotesComponent />
    </App>
  }
])

createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
)
