import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import type { ApiConfig } from '../types';

export interface GraphQLConfig extends ApiConfig {
  wsEndpoint?: string;
  cache?: {
    typePolicies?: Record<string, any>;
    maxSize?: number;
  };
  batch?: {
    enabled: boolean;
    maxBatchSize?: number;
  };
}

export interface GraphQLClient {
  query: <T = any>(query: string, variables?: any) => Promise<T>;
  mutate: <T = any>(mutation: string, variables?: any) => Promise<T>;
  subscribe: <T = any>(subscription: string, variables?: any, callback: (data: T) => void) => () => void;
  cache: {
    read: <T = any>(query: string, variables?: any) => T | null;
    write: <T = any>(query: string, variables: any, data: T) => void;
    clear: () => void;
  };
}

export function createGraphQL(config: GraphQLConfig = {}): GraphQLClient {
  const {
    baseURL = '/graphql',
    wsEndpoint,
    cache = {},
    batch = { enabled: false }
  } = config;

  // Create HTTP link
  const httpLink = new HttpLink({
    uri: baseURL,
    credentials: 'include'
  });

  // Create WebSocket link if endpoint is provided
  const wsLink = wsEndpoint
    ? new GraphQLWsLink(
        createClient({
          url: wsEndpoint,
          connectionParams: {
            // Add any authentication headers here
          }
        })
      )
    : null;

  // Split links based on operation type
  const link = wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },
        wsLink,
        httpLink
      )
    : httpLink;

  // Create Apollo Client
  const client = new ApolloClient({
    link,
    cache: new InMemoryCache({
      typePolicies: cache.typePolicies,
      maxSize: cache.maxSize
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network'
      }
    }
  });

  const graphqlClient: GraphQLClient = {
    async query<T = any>(query: string, variables?: any): Promise<T> {
      const { data } = await client.query<T>({
        query,
        variables
      });
      return data;
    },

    async mutate<T = any>(mutation: string, variables?: any): Promise<T> {
      const { data } = await client.mutate<T>({
        mutation,
        variables
      });
      return data;
    },

    subscribe<T = any>(
      subscription: string,
      variables?: any,
      callback: (data: T) => void
    ): () => void {
      const subscription = client.subscribe<T>({
        query: subscription,
        variables
      }).subscribe({
        next: ({ data }) => callback(data)
      });

      return () => subscription.unsubscribe();
    },

    cache: {
      read<T = any>(query: string, variables?: any): T | null {
        return client.cache.read<T>({ query, variables });
      },

      write<T = any>(query: string, variables: any, data: T): void {
        client.cache.write({ query, variables, data });
      },

      clear(): void {
        client.cache.reset();
      }
    }
  };

  return graphqlClient;
}

export default createGraphQL; 