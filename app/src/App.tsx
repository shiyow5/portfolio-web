import { Layout } from './components/layout/Layout';

// The site renders as one of two self-contained single-page experiences
// (editorial / terminal) chosen via useMode(); there is no client-side router.
export default function App() {
  return <Layout />;
}
