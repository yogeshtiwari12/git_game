import React from 'react';
// import list from '../component/list.json';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from 'axios';
import Card from './card';
import { useState,useEffect } from 'react';

function Cards() {


const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
     

      try {
        const response = await axios.get('http://localhost:4000/book');
        const filterdata = response.data.filter((data) => data.category === "free");
      
        setBooks(filterdata);
      } catch (err) {
        console.error('Error fetching books:', err);
      
      } finally {
       console.log("data loaded...")
      }
    };
fetchData()

},[])



  var settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,  // Show 3 slides by default
    slidesToScroll: 3,  // Scroll 3 slides at a time
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  }

  
  // console.log(books);

  return (
    <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 ">
      <div>
        <h1 className="font-bold text-xl pb-2">Free offered courses</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea Sed do eiusmod.</p>
      </div>
      <div className="slider-container overflow">
        <Slider {...settings}>
          
          {books.map((item) => (
            <Card item={item} key={item.id} />
          ))}
        </Slider>
      </div>
    </div>
  )
}

export default Cards;
