import { useState } from 'react'
import './App.css'
import LandingPage from './components/landingPage/LandingPage'
import Footer from './components/footer/Footer'

function App() {
//user not authenticated will hit the landing page and an option for login

//return our components so they can be rendered
  return (
    <>

      <LandingPage />

      <Footer />

    </>
  )

//authenticated/logged in users will need to see a different page 
//need to add logic  and then render different components as a home page. 



}

export default App
