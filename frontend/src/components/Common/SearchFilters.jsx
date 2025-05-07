import React, { useState } from 'react';
import "./../../styles/SearchFilter.css"

function SearchFilters({ onSearch, onFilterChange, currentFilters, availableCategories }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="search-filters">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search books..."
        />
        <button type="submit">Search</button>
      </form>

      <div className="filter-controls">
        <select
          value={currentFilters.category}
          onChange={(e) => onFilterChange({ category: e.target.value })}
        >
          <option value="">All Categories</option>
          {availableCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={currentFilters.sort}
          onChange={(e) => onFilterChange({ sort: e.target.value })}
        >
          <option value="relevance">Sort by Relevance</option>
          <option value="newest">Sort by Newest</option>
        </select>
      </div>
    </div>
  );
}

export default SearchFilters;