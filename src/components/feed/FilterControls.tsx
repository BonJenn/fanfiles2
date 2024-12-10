import { SortOption, ContentType } from './Feed';

interface FilterControlsProps {
  sortBy: SortOption;
  contentType: ContentType;
  onSortChange: (sort: SortOption) => void;
  onTypeChange: (type: ContentType) => void;
  onSearch: (query: string) => void;
}

export const FilterControls = ({
  sortBy,
  contentType,
  onSortChange,
  onTypeChange,
  onSearch
}: FilterControlsProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="search"
            placeholder="Search posts..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_high">Price: High to Low</option>
          <option value="price_low">Price: Low to High</option>
        </select>

        <div className="flex rounded-lg border overflow-hidden">
          {(['all', 'image', 'video'] as ContentType[]).map((type) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={`px-4 py-2 ${
                contentType === type
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
