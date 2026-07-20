import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Star, BookOpen } from 'lucide-react';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [priceFilter]);

  const fetchCourses = () => {
    setLoading(true);
    let url = '/api/courses/';
    const params = [];
    if (priceFilter) params.push(`price=${priceFilter}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    axios.get(url)
      .then(res => {
        setCourses(res.data.results || res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchCourses();
      return;
    }
    setLoading(true);
    axios.get(`/api/courses/search_courses/?q=${searchQuery}`)
      .then(res => {
        setCourses(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      {/* Hero Banner */}
      <div className="premium-card home-hero">
        <h1 className="home-hero-title">
          Shape Your Future with Lumina Learning
        </h1>
        <p className="home-hero-copy">
          Explore professional, mentor-guided courses built for tomorrow's industry leaders.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="home-search-form">
          <div className="home-search-field">
            <Search className="home-search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search for courses, technologies, or skills..." 
              className="form-input home-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary home-search-button">Search</button>
        </form>
      </div>

      {/* Course List Section */}
      <div className="home-courses-layout">
        {/* Filters Sidebar */}
        <div className="premium-card home-filters">
          <h3 style={{ marginBottom: '20px' }}>Filters</h3>
          
          <div className="form-group">
            <label className="form-label">Price Range</label>
            <select 
              className="form-input" 
              value={priceFilter} 
              onChange={e => setPriceFilter(e.target.value)}
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
              <option value="">All Prices</option>
              <option value="0.00">Free Courses</option>
            </select>
          </div>
        </div>

        {/* Catalog Grid */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading courses...</p>
          ) : courses.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No courses found match your criteria.</p>
          ) : (
            <div className="grid-cols-3">
              {courses.map(course => (
                <div key={course.id} className="premium-card course-card">
                  <div className="course-card-header">
                    <span className="course-card-status">
                      {course.status}
                    </span>
                    <span className="course-card-price">
                      {course.price === '0.00' ? 'Free' : `₹${parseFloat(course.price).toLocaleString()}`}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', height: '50px', overflow: 'hidden' }}>{course.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', flex: 1, height: '60px', overflow: 'hidden' }}>
                    {course.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-warning)', fontSize: '0.9rem' }}>
                      <Star size={16} fill="currentColor" />
                      <span>{course.average_rating.toFixed(1)}</span>
                    </div>
                    <Link to={`/courses/${course.id}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
