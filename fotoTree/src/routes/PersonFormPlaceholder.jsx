import React from 'react'
import Header from '../components/header/Header'
import Footer from '../components/footer/Footer'

const PersonFormPlaceholder = () => {
  return (
    <>
    <Header />
    <br /><br />
    <div>PersonFormPlaceholder</div>
<br />

    <form >
        <input type="text" placeholder='name'/>
        <input type="text" placeholder='dob'/>
        <input type="text" placeholder='phone'/>
        <input type="text" placeholder='favorite animal'/>
        <input type="text" placeholder='Do you eat boogers?'/>

    </form>

<button className='btn btn-warning mt-4'>Submit</button>
    <Footer />
    </>
  )
}

export default PersonFormPlaceholder