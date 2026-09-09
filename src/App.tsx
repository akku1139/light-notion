import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/Home';
import PageList from './pages/PageList';
import PageView from './pages/PageView';
import PageEdit from './pages/PageEdit';
import SearchPage from './pages/Search';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pages" element={<PageList />} />
          <Route path="/page/:id" element={<PageView />} />
          <Route path="/edit/:id" element={<PageEdit />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
