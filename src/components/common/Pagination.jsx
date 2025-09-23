import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage = 10, 
  totalItems = 0 
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-3 sm:p-4 bg-[hsl(45,100%,95%)] rounded-lg border border-[hsl(45,100%,85%)]">
      <div className="text-xs sm:text-sm text-[hsl(45,100%,20%)] text-center sm:text-left">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
        <div className="flex items-center gap-1 sm:gap-2 order-2 sm:order-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-[hsl(45,100%,20%)] bg-white border border-[hsl(45,100%,85%)] rounded-lg hover:bg-[hsl(45,100%,95%)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} className="mr-1" />
            <span className="hidden xs:inline">Previous</span>
            <span className="xs:hidden">Prev</span>
          </button>
          
          <div className="flex items-center gap-1">
            {getVisiblePages().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={page === '...'}
                className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors min-w-[32px] sm:min-w-[36px] ${
                  page === currentPage
                    ? 'bg-[hsl(45,43%,58%)] text-white'
                    : page === '...'
                    ? 'text-[hsl(45,100%,20%)] cursor-default'
                    : 'text-[hsl(45,100%,20%)] bg-white border border-[hsl(45,100%,85%)] hover:bg-[hsl(45,100%,95%)]'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-[hsl(45,100%,20%)] bg-white border border-[hsl(45,100%,85%)] rounded-lg hover:bg-[hsl(45,100%,95%)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden xs:inline">Next</span>
            <span className="xs:hidden">Next</span>
            <ChevronRight size={14} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;