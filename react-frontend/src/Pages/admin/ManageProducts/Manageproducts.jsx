import { useState, useEffect, } from "react";
import { Link } from "react-router-dom";
import { useProducts, useDeleteProduct } from '../../../hooks/useProducts';

export default function Manageproducts() {
  const { data: products, isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();

  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/products/search', { search }); // adjust as needed
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


  return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      <div className="flex h-[10%]">
        <label className="text-4xl font-sans font-[500] antialiased">Manage Product</label>
        <Link 
          to="/admin/createProduct" className="ml-auto bg-green-700 text-white rounded-sm w-40 h-10 flex justify-center items-center text-lg text-center">Add Product
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex h-[10%] items-center">
        <input
          className="h-10 w-64 bg-white pl-3"
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          name="search"
        />
        <button className="bg-gray-200 flex justify-center items-center" type="submit">
          <i className="fa fa-search bg-gray-100 p-3"></i>
        </button>
      </form>

      <div className="overflow-y-auto h-[80%]">
        <table className="w-full text-center border-collapse table-fixed font overflow-auto">
          <thead>
            <tr className="bg-gray-50 sticky top-0">
              <th className="p-3">Name</th>
              <th>Image</th>
              <th>Big</th>
              <th>Medium</th>
              <th>Platter</th>
              <th>Tub</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">Loading...</td>
              </tr>
            ) : products.products && products.products.length > 0 ? (
              products.products.map((product) => (
                <tr key={product.id} className="bg-white text-sm h-14">
                  <td className="p-3">{product.name}</td>
                  <td>
                    <img
                      className="h-10 w-10 inline rounded-4xl"
                      src={`http://localhost:8000/storage/${product.image}`}
                      alt={product.name}
                    />
                  </td>
                  <td>{product.big}</td>
                  <td>{product.medium}</td>
                  <td>{product.platter}</td>
                  <td>{product.tub}</td>
                  <td>
                    <div className="flex justify-center items-center gap-2 h-full">

                      <Link to={`/admin/updateProduct/${product.id}`} className="bg-gray-100 text-green-600 h-8 w-20 flex justify-center items-center">
                        <i className="fas fa-edit"></i> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-gray-100 text-red-600 h-8 w-20 flex justify-center items-center"
                      >
                        <i className="fa fa-trash"></i> Delete
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

