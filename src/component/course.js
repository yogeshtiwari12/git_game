import React, { useEffect, useState } from 'react';
import Card from './card';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Course() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false); // Track loading state
  const [error, setError] = useState(null); // Store any errors

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); 
      setError(null); 

      try {
        const response = await axios.get('http://localhost:4000/book');
        setBooks(response.data);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError(err); 
      } finally {
        setLoading(false); 
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-screen-2xl container mx-auto md:px-20 px-4">
      <div className="mt-28 items-center justify-center text-center">
        <h1 className="text-3xl font-bold">
          We're delighted to have you <span className="text-green-400">Here :)</span>
        </h1>
        <p className="w-50 mt-8">
       

        </p>
        <Link to="/">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-6">
            Back
          </button>
        </Link>
      </div>

      {loading && <p>Loading courses...</p>}
      {error && <p>Error fetching courses: {error.message}</p>}



      {!loading && !error && books.length > 0 && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          {books.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Display a message if there are no courses and no errors */}
      {!loading && !error && books.length === 0 && (
        <p>No courses found.</p>
      )}
    </div>
  );
}

export default Course;
