import React from 'react'
import { Link } from 'react-router-dom'

const OtherPage = () => {
  return (
    <div>
      Im Some other page
      <Link to="/">Go back home</Link>
    </div>
  )
}

export default OtherPage
