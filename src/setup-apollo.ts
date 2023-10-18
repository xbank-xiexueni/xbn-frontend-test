import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client'

const abortController = new AbortController()
const httpLink = createHttpLink({
  uri: `${process.env.REACT_APP_BASE_URL}/lending/query`,
  fetchOptions: {
    mode: 'cors',
    signal: abortController.signal,
  },
})

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: httpLink,
})

export default ApolloProvider