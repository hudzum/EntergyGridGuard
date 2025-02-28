import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from 'react-router'
import UploadPage from './pages/Uploadpage.tsx'
import QueryPage from './pages/QueryPage.tsx'
import { CardWithForm } from './Checker.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes >
        <Route path ="/" element ={<App/>}/>

        <Route path ="map"  />

        <Route path = "query" element = {<QueryPage/>}/>

        <Route path = "upload" element = {<UploadPage/>}/>
      </Routes>
   
    </BrowserRouter>
  </StrictMode>,
)
