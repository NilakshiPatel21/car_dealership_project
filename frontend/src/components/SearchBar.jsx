import { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  const [make, setMake] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ make, category, minPrice, maxPrice });
  };

  const handleClear = () => {
    setMake('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    onSearch({});
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 mb-8">
      <input
        type="text"
        placeholder="Make"
        value={make}
        onChange={(e) => setMake(e.target.value)}
        className="bg-neutral-800 text-white rounded-lg px-4 py-2 border border-neutral-700 focus:border-purple-500 focus:outline-none flex-1 min-w-[120px]"
      />
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="bg-neutral-800 text-white rounded-lg px-4 py-2 border border-neutral-700 focus:border-purple-500 focus:outline-none flex-1 min-w-[120px]"
      />
      <input
        type="number"
        placeholder="Min price"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        className="bg-neutral-800 text-white rounded-lg px-4 py-2 border border-neutral-700 focus:border-purple-500 focus:outline-none w-32"
      />
      <input
        type="number"
        placeholder="Max price"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        className="bg-neutral-800 text-white rounded-lg px-4 py-2 border border-neutral-700 focus:border-purple-500 focus:outline-none w-32"
      />
      <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 flex items-center gap-2">
        <Search size={18} /> Search
      </button>
      <button type="button" onClick={handleClear} className="bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg px-4 py-2">
        Clear
      </button>
    </form>
  );
};

export default SearchBar;