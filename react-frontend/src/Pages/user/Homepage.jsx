import { Link } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";
import { useState } from "react";

export default function Homepage() {

     const [currentPage, setCurrentPage] = useState(1);
      const [perPage, setPerPage] = useState(9);
      const [input, setInput] = useState('');
      const [search, setSearch] = useState('');
    
      const { data, isLoading, error } = useProducts(currentPage, perPage, search);
      const products = data?.data;
    
      const totalPages = data?.last_page || data?.meta?.last_page || 1;

      const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        }
    };
    const handleSearch = () => {
        setSearch(input);
        setCurrentPage(1);
    };

    const renderPaginationButtons = () => {
      const buttons = [];
      const maxVisiblePages = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      buttons.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 mx-1 bg-white border text-sm  text-green-700 rounded-lg font-medium transition-all duration-200 hover:bg-green-50  hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-green-200 disabled:hover:shadow-none"
        >
          Previous
        </button>
      );

      for (let i = startPage; i <= endPage; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-4 py-2 mx-1 rounded-lg font-medium transition-all duration-200 text-sm ${
              i === currentPage
                ? 'bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white shadow-lg  border-green-700'
                : 'bg-white border  text-green-700 hover:bg-green-50 '
            }`}
          >
            {i}
          </button>
        );
      }

      buttons.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 text-sm mx-1 bg-white border text-green-700 rounded-lg font-medium transition-all duration-200 hover:bg-green-50  hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-green-200 disabled:hover:shadow-none"
        >
          Next
        </button>
      );

      return buttons;
  };

    return (
        <div className="w-full py-16 box-border" id="Container">

            <div className="mb-16 flex justify-end items-center">

                <label className="text-[2.50rem]  font-medium antialiased mr-auto ">Products</label>
                <div className="flex h-[10%] items-center mr-6">
                    <input
                    className="h-12 w-64 bg-white pl-3 border-2 border-gray-100 rounded-l"
                    type="text"
                    placeholder="Search"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    name="search"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    />
                    <button className="bg-gray-200 flex justify-center items-center" onClick={handleSearch} type="submit">
                        <i className="fa fa-search bg-gray-100 p-4"></i>
                    </button>
                </div>
                <Link to={'/cart'}  className="fa fa-shopping-cart text-2xl"> </Link>


            </div>

            <div className="h-auto w-full mt-3 mb-8 flex flex-wrap justify-center gap-x-16 gap-y-14">
              {isLoading ? (<div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span>Loading products...</span>
              </div>)
              : (products?.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white w-[26%] lg:h-96  text-center shadow rounded"
                    >
                        <Link to={`/viewProduct/${product.id}`}>
                            <img
                                src={`http://localhost:8000/storage/${product.image}`}
                                alt={product.name}
                                className="h-4/5 w-full object-cover mb-4"
                            />
                            <div>
                                <span className="text-xl font-medium mr-3">{product.name}</span>
                                <span className="text-sm font-medium">₱-{product.tub||product.platter||product.medium||product.big}</span>
                            </div>
                        </Link>
                    </div>
                )
                ))}
                
            </div>

            {products && products.length>0 &&(
              <div className="flex justify-center">
                {renderPaginationButtons()}
             </div>)}
             
             {!isLoading && products?.length === 0 && (
              <div className="w-full text-center">No results found.</div>
            )}
            
        </div>
    );
}

