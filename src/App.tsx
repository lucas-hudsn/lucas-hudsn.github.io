import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Blog from './pages/Blog'
import PostPage from './pages/PostPage'
import ReadingWatching from './pages/ReadingWatching'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<PostPage type="projects" />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<PostPage type="blog" />} />
        <Route path="/reading-watching" element={<ReadingWatching />} />
      </Route>
    </Routes>
  )
}
