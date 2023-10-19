import { Fallback } from 'components'
import Test from 'components/Test'
import NewComer from 'pages/new-comer/NewComer'
import { Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import lazyWithRetries from 'utils/lazyWithRetries'

// Lend
const Lend = lazyWithRetries(() => import('./pages/lending/Lend'))
const PoolCreateAndEdit = lazyWithRetries(
  () => import('./pages/lending/Create'),
)

// buy nfts
const Market = lazyWithRetries(() => import('./pages/market/Market'))
const MyAssets = lazyWithRetries(() => import('./pages/my-assets/MyAssets'))
const LoansForBuyer = lazyWithRetries(() => import('./pages/loan/Loans'))
const CompleteList = lazyWithRetries(
  () => import('./pages/complete-list/CompleteList'),
)

// nft detail
const NftAssetDetail = lazyWithRetries(
  () => import('./pages/market/NftAssetDetail'),
)

// marketing campaign
const MarketingCampaign = lazyWithRetries(
  () => import('./pages/marketing-campaign/MarketingCampaign'),
)
const NotFound = lazyWithRetries(() => import('./pages/404'))
const History = lazyWithRetries(() => import('./pages/history/History'))
const router = createBrowserRouter([
  {
    path: '/',
    element: <Test />,
    // element: (
    //   <Navigate
    //     to={'/market'}
    //     replace
    //   />
    // ),
  },
  {
    path: '/lending',
    element: (
      <Navigate
        replace
        to={'/lending/collections'}
      />
    ),
  },
  {
    path: '/history',
    element: (
      <Navigate
        replace
        to={'/history/loan'}
      />
    ),
  },
  {
    path: '/history/:type',
    element: (
      <Suspense fallback={<Fallback />}>
        <History />
      </Suspense>
    ),
  },
  {
    path: '/lending/my-pools',
    element: (
      <Suspense fallback={<Fallback />}>
        <Lend />
      </Suspense>
    ),
  },
  {
    path: '/lending/:action/:contract?',
    element: (
      <Suspense fallback={<Fallback />}>
        <PoolCreateAndEdit />
      </Suspense>
    ),
  },
  {
    path: '/lending/collections',
    element: (
      <Suspense fallback={<Fallback />}>
        <Lend></Lend>
      </Suspense>
    ),
  },
  {
    path: '/lending/loans',
    element: (
      <Suspense fallback={<Fallback />}>
        <Lend />
      </Suspense>
    ),
  },
  {
    path: '/market/:contract?',
    element: (
      <Suspense fallback={<Fallback />}>
        <Market />
      </Suspense>
    ),
  },
  {
    path: '/asset/:contractAddress/:tokenID',
    // path='/asset/:asset_contract_address'
    element: (
      <Suspense fallback={<Fallback />}>
        <NftAssetDetail />
      </Suspense>
    ),
  },
  {
    path: '/my-assets',
    element: (
      <Suspense fallback={<Fallback />}>
        <MyAssets />
      </Suspense>
    ),
  },
  {
    path: '/complete',
    element: (
      <Suspense fallback={<Fallback />}>
        <CompleteList />
      </Suspense>
    ),
  },
  {
    path: '/loans',
    element: (
      <Suspense fallback={<Fallback />}>
        <LoansForBuyer />
      </Suspense>
    ),
  },
  {
    path: '/marketing-campaign',
    element: (
      <Suspense fallback={<Fallback />}>
        <MarketingCampaign />
      </Suspense>
    ),
  },
  {
    path: '/newcomer',
    element: (
      <Suspense fallback={<Fallback />}>
        <NewComer />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense>
        <NotFound />
      </Suspense>
    ),
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
