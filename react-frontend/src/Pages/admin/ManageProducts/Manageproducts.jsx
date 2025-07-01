import { useState, useEffect, } from "react";
import { Link } from "react-router-dom";
import { useProducts, useDeleteProduct } from '../../../hooks/useProducts';

export default function Manageproducts() {

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(9);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useProducts(currentPage, perPage, search);
  const products = data?.data;

  const totalProducts = data?.total || data?.meta?.total || 0; // Fixed variable name
  const totalPages = data?.last_page || data?.meta?.last_page || 1;
  const deleteProduct = useDeleteProduct();

  
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePerPageChange = (e) => {
    setPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setSearch(input);
    setCurrentPage(1);
  };
 
  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct.mutate(id, {
        onSuccess: () => {
          console.log('Product deleted');
        },
        onError: (error) => {
          console.error('Delete failed', error);
        }
      });
    }
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
        className="px-3 py-2 mx-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
    );

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 mx-1 rounded ${
            i === currentPage
              ? 'bg-green-700 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
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
        className="px-3 py-2 mx-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    );

    return buttons;
  };

  return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      <div className="flex h-[10%]">
        <label className="text-4xl antialiased font-semibold">Manage Product</label>
        <Link 
          to="/admin/createProduct" className="ml-auto bg-green-700 hover:bg-green-800 text-white rounded-sm w-40 h-10 flex justify-center items-center text-lg text-center font-medium">
            Add Product
        </Link>
      </div>

      <div className="flex h-[10%] items-center">
        <input
          className="h-12 w-64 bg-white pl-3 rounded-l-md"
          type="text"
          placeholder="Search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          name="search"
        />
        <button className="bg-gray-200 flex justify-center items-center " onClick={handleSearch} type="submit" 
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}>
          <i className="fa fa-search bg-gray-100 p-4 rounded-r-md"></i>
        </button>
      </div>

      <div className="h-[80%] overflow-hidden border border-gray-200">
        <div className="overflow-auto rounded-md" >
          <table className="w-full text-center border-collapse table-fixed">
            <thead>
              <tr className="bg-gray-50 sticky top-0">
                <th className="text-gray-700 font-semibold py-3">Name</th>
                <th className="text-gray-700 font-semibold">Image</th>
                <th className="text-gray-700 font-semibold">Big</th>
                <th className="text-gray-700 font-semibold">Medium</th>
                <th className="text-gray-700 font-semibold">Platter</th>
                <th className="text-gray-700 font-semibold">Tub</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-red-500">
                    Error: {error.message || 'Failed to load products'}
                  </td>
                </tr>
              ) : products && Array.isArray(products) && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="bg-white text-sm h-14">
                    <td className="p-3 font-semibold text-md">{product.name}</td>
                    <td>
                      <img
                        className="h-10 w-10 inline rounded-4xl"
                        src={`http://localhost:8000/storage/${product.image}`}
                        alt={product.name}
                      />
                    </td>
                    <td className="text-gray-600 font-semibold">{product.big}</td>
                    <td className="text-gray-600 font-semibold">{product.medium}</td>
                    <td className="text-gray-600 font-semibold">{product.platter}</td>
                    <td className="text-gray-600 font-semibold">{product.tub}</td>
                    <td>
                      <div className="flex justify-center items-center gap-2 h-full">
                        <Link to={`/admin/updateProduct/${product.id}`} className="bg-gray-50 hover:bg-gray-100 text-green-700 h-8 w-20 flex justify-center items-center rounded-md">
                          <i className="fas fa-edit"></i> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="bg-gray-50 hover:bg-gray-100 text-red-700 h-8 w-20 flex justify-center items-center rounded-md"
                        >
                          <i className="fa fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No products found. {data ? `Check console for data structure.` : 'No data received from API.'}
                  </td>
                </tr>
              )}
          
            </tbody>
          </table>
        </div>
        <div className="flex justify-center border-t border-gray-200 pt-4">
          {renderPaginationButtons()}
        </div>
      </div>
    </div>
  );
}