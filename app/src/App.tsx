import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './routes/Home';

// Home stays eager (it is the landing route); the rest are code-split so the
// first paint only ships the home + shared chunks instead of every route.
const About = lazy(() => import('./routes/About').then((m) => ({ default: m.About })));
const Gallery = lazy(() => import('./routes/Gallery').then((m) => ({ default: m.Gallery })));
const WorkDetail = lazy(() =>
  import('./routes/WorkDetail').then((m) => ({ default: m.WorkDetail })),
);
const Changelog = lazy(() => import('./routes/Changelog').then((m) => ({ default: m.Changelog })));
const NotFound = lazy(() => import('./routes/NotFound').then((m) => ({ default: m.NotFound })));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="works/:id" element={<WorkDetail />} />
        <Route path="changelog" element={<Changelog />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
