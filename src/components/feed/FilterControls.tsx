import { useState } from 'react';
import { SortOption, ContentType } from './Feed';
import { 
  ArrowUpDown, 
  Search, 
  Image as ImageIcon, 
  Film,
  Clock,
  TrendingUp,
  TrendingDown,
  X,
  LayoutGrid
} from 'lucide-react';

interface FilterControlsProps {
  sortBy: SortOption;
  contentType: ContentType;
  onSortChange: (sort: SortOption) => void;
  onTypeChange: (type: ContentType) => void;
  onSearch: (query: string) => void;
  activeTab?: 'following' | 'forYou';
  onTabChange?: (tab: 'following' | 'forYou') => void;
}

export const FilterControls = ({
  sortBy,
  contentType,
  onSortChange,
  onTypeChange,
  onSearch,
  activeTab,
  onTabChange,
}: FilterControlsProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Tab Buttons - Centered with spacing */}
      {activeTab && onTabChange && (
        <div className="flex justify-center w-full">
          <div className="inline-flex space-x-2 bg-white/80 rounded-lg shadow-sm">
            <button
              onClick={() => onTabChange('following')}
              className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'following'
                  ? 'text-black bg-gray-50 border border-gray-100'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
              }`}
            >
              Following
            </button>
            <button
              onClick={() => onTabChange('forYou')}
              className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'forYou'
                  ? 'text-black bg-gray-50 border border-gray-100'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
              }`}
            >
              For You
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="w-full">
        <div className="flex items-center bg-white/80 rounded-lg border border-gray-100 shadow-sm">
          <Search className="w-4 h-4 text-gray-400 ml-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full px-3 py-2.5 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="mr-2 p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Controls Row */}
      <div className="flex justify-between items-center w-full space-x-4">
        {/* Content Type Filter */}
        <div className="inline-flex space-x-2">
          <button
            onClick={() => onTypeChange('all')}
            className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              contentType === 'all'
                ? 'text-black bg-gray-50 border border-gray-100'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
            }`}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            All
          </button>
          <button
            onClick={() => onTypeChange('image')}
            className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              contentType === 'image'
                ? 'text-black bg-gray-50 border border-gray-100'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
            }`}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Images
          </button>
          <button
            onClick={() => onTypeChange('video')}
            className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              contentType === 'video'
                ? 'text-black bg-gray-50 border border-gray-100'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
            }`}
          >
            <Film className="w-4 h-4 mr-2" />
            Videos
          </button>
        </div>

        {/* Sort Button */}
        <button
          className="flex items-center gap-2 px-6 py-2.5 bg-white/80 rounded-lg border border-gray-100 
            text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm ml-4"
        >
          <ArrowUpDown className="w-4 h-4" />
          Sort
        </button>
      </div>
    </div>
  );
};
