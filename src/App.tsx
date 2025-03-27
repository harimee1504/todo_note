import React from "react";
// import { useNavigate } from "react-router-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  NormalizedCacheObject,
} from "@apollo/client";
import TodoComponment from "./pages/todo";
import { setContext } from "@apollo/client/link/context";
import { useAuth, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

const Wrapper = React.lazy(() => import("auth/wrapper"!));
const cache = new InMemoryCache();

// Initialize with default values
let client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  cache,
  link: createHttpLink({
    uri: "https://todo-note-server.onrender.com/graphql",
  }),
});

let data = {
  navMain: [
    {
      title: "TaskNote",
      url: "#",
      icon: undefined,
      isActive: true,
      items: [
        {
          title: "Todo",
          url: () => {},
        },
        {
          title: "Note",
          url: () => {},
        },
      ],
    },
  ],
};

const TodoNote = () => {
  const { getToken } = useAuth();
  const httpLink = createHttpLink({
    uri: "https://todo-note-server.onrender.com/graphql",
    credentials: "include",
    fetchOptions: {
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    },
  });
  
  const authLink = setContext(async (_, { headers }) => {
    try {
      const token = await getToken();
      return {
        headers: {
          ...headers,
          Authorization: `Bearer ${token}`
        },
      };
    } catch (error) {
      console.error("Error getting auth token:", error);
      return {
        headers: {
          ...headers,
          Authorization: ""
        },
      };
    }
  });
  
  client = new ApolloClient({
    cache: cache,
    link: authLink.concat(httpLink),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
        errorPolicy: 'ignore',
      },
    },
    connectToDevTools: true,
  });

  return (
    <ApolloProvider client={client}>
      <TodoComponment />
    </ApolloProvider>
  );
}

const AppWithWrapper = ({
  data,
  children,
}: {
  data: any;
  children: React.ReactNode;
}) => {
  return (
    <Wrapper data={data}>
      <SignedIn>
        <TodoNote />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </Wrapper>
  );
};

export const AppWithOutWrapper = () => {
  return (
    <ApolloProvider client={client}>
      <SignedIn>
        <TodoComponment />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
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
export const ExposedClient = client;

export default App;
