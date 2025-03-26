import React from "react";
// import { useNavigate } from "react-router-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import TodoComponment from "./pages/todo";
import { setContext } from "@apollo/client/link/context";
import { useAuth } from "@clerk/clerk-react";

// Declare Clerk types
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string>;
      };
    };
  }
}

const Wrapper = React.lazy(() => import("auth/wrapper"!));
const cache = new InMemoryCache();

const httpLink = createHttpLink({
  uri: "https://todo-note-server.onrender.com/graphql",
  credentials: "include",
  fetchOptions: {
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  },
});

// Create an auth link that adds the token to every request
const authLink = setContext(async (_, { headers }) => {
  try {
    // Get the session token from Clerk
    const token = await window.Clerk?.session?.getToken();

    // Return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  } catch (error) {
    console.error("Error getting auth token:", error);
    return {
      headers: {
        ...headers,
        authorization: "",
      },
    };
  }
});

export const client = new ApolloClient({
  cache: cache,
  link: authLink.concat(httpLink),
});

let data: {
  navMain: {
    title: string;
    url: string;
    icon: undefined;
    isActive: boolean;
    items: { title: string; url: () => void }[];
  }[];
};

const AppWithWrapper = ({
  data,
  children,
}: {
  data: any;
  children: React.ReactNode;
}) => {
  return (
    <Wrapper
      data={data}
      publishableKey={import.meta.env.VITE_REACT_APP_CLERK_PUBLISHABLE_KEY}
    >
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

export const exposedData = data;

export default App;
