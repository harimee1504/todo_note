import React from "react";
// import { useNavigate } from "react-router-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import TodoComponment from "./pages/todo";

const Wrapper = React.lazy(() => import("auth/wrapper"!));
const cache = new InMemoryCache();

const link = createHttpLink({
  uri: "https://todo-note-server.vercel.app/graphql",
  credentials: "include",
});

export const client = new ApolloClient({
  cache: cache,
  link,
});


let data: { navMain: { title: string; url: string; icon: undefined; isActive: boolean; items: { title: string; url: () => void; }[]; }[]; };


const AppWithWrapper = ({data, children}:{data:any, children:React.ReactNode}) => {
  return (
    <Wrapper data={data} publishableKey={import.meta.env.VITE_REACT_APP_CLERK_PUBLISHABLE_KEY}>
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </Wrapper>
  );
};

export const AppWithOutWrapper = () => {
  return (
    <ApolloProvider client={client}>
      <TodoComponment />
    </ApolloProvider>
  );
};

const App = ({
  children,
  option,
}: {
  children: React.ReactNode;
  option?: string;
}) => {
  // const navigate = useNavigate();

  data = {
    navMain: [
      {
        title: "TaskNote",
        url: "#",
        icon: undefined,
        isActive: true,
        items: [
          {
            title: "Todo",
            url: () => {}, //navigate("/todo"),
          },
          {
            title: "Note",
            url: () => {}, //navigate("/note"),
          },
        ],
      },
    ],
  };

  return option === "withWrapper" ? (
    <AppWithWrapper data={data}>{children}</AppWithWrapper>
  ) : option === "withoutWrapper" ? (
    <AppWithOutWrapper />
  ) : (
    <></>
  );
};


export default App;
