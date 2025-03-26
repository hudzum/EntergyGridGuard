import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from 'react-router'
import UploadPage from './pages/Uploadpage.tsx'
import QueryPage from './pages/QueryPage.tsx'
import ThumbnailPage from './pages/ThumbnailPage.tsx'
import {MapPage} from "@/map/MapPage.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes >
        <Route path ="/" element ={<App/>}/>

        <Route path ="map" element={<MapPage />} />

        <Route path = "query" element = {<QueryPage/>}/>

        <Route path = "upload" element = {<UploadPage/>}/>

        <Route path = "thumbnail" element = {<ThumbnailPage/>}/>


      </Routes>
   
    </BrowserRouter>
  </StrictMode>,
)
