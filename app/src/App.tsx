import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './routes/Home';
import { About } from './routes/About';
import { Gallery } from './routes/Gallery';
import { WorkDetail } from './routes/WorkDetail';
import { Changelog } from './routes/Changelog';
import { NotFound } from './routes/NotFound';

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
