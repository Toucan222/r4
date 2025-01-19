import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/shared/Layout'
import Card1 from './components/Card1'
import Card2 from './components/Card2'
import Card3 from './components/Card3'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Card1 />} />
        <Route path="/card2" element={<Card2 />} />
        <Route path="/card3" element={<Card3 />} />
      </Routes>
    </Layout>
  )
}
