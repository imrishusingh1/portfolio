import React from 'react'
import './Loader.css'

export default function Loader() {
  return (
    <div className="global-loader-wrapper">
      <div className="global-loader-spinner"></div>
      <h2 className="global-loader-text">Building Experience...</h2>
    </div>
  )
}
