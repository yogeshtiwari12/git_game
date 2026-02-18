import React from 'react'

function Card({item}) {
    
  return (
<div >

    <div class="card w-80 bg-base-100 shadow-md mb-2 mt-4 py-4 hover:scale-105 duration-200">
    <figure><img src={item.image} alt="Shoes" /></figure>
    <div class="card-body">
      <h2 class="card-title">
        {item.name}
        <div class="bg-green-500 rounded-xl text-white px-2 text-sm">NEW</div>
      </h2>
      <p>{item.description}</p>
      <div class="card-actions justify-between mt-4">
        <div class="badge badge-outline py-4">$ {item.price}</div> 
        <div class="badge badge-outline py-4 hover:bg-green-500 hover:text-white hover:py-4 duration-200">Buy now</div>
      </div>
    </div>
  </div>
</div>

  )
}

export default Card
