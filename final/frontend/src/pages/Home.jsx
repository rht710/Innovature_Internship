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
      <div className="premium-card" style={{
        marginBottom: '40px',
        padding: '60px 40px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '16px', color: 'var(--text-primary)', fontWeight: '800' }}>
          Shape Your Future with Lumina Learning
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto 32px' }}>
          Explore professional, mentor-guided courses built for tomorrow's industry leaders.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', maxWidth: '600px', margin: '0 auto', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} size={20} />
            <input 
              type="text" 
              placeholder="Search for courses, technologies, or skills..." 
              className="form-input" 
              style={{ paddingLeft: '48px', height: '48px' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '48px', padding: '0 28px' }}>Search</button>
        </form>
      </div>

      {/* Course List Section */}
      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
        {/* Filters Sidebar */}
        <div className="premium-card" style={{ width: '280px', flexShrink: 0 }}>
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
                <div key={course.id} className="premium-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--accent-primary)', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                      {course.status}
                    </span>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
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
