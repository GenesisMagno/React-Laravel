import { useState } from "react";
import { useProducts, useCreateProduct } from '../../hooks/useProducts';

export default function Manageproducts(){
    const { data: products, isLoading } = useProducts();
    const createProduct = useCreateProduct();

    const [search, setSearch] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/products/search', { search }); // adjust URL if needed
    };

    const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
        router.delete(`/products/${id}`, {
        onSuccess: () => {
            // Optionally show a success message or toast
            console.log('Product deleted');
        },
        });
    }
    };

    return(
        <div className="w-full h-full overflow-hidden flex flex-col">  
            <div className="flex  h-[10%] ">
                <label className="text-4xl font-sans font-[500] antialiased">Manage Product</label>
                <Link href="/products/create" className="ml-auto bg-green-700 text-white rounded-sm w-40 h-10 flex justify-center items-center text-lg text-center">Add Product</Link>
            </div>

            <form onSubmit={handleSearch} className="flex h-[10%]  items-center">
            <input
                className="h-10 w-64 bg-white pl-3"
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                name="search"
            />
            <button className="bg-gray-200 flex justify-center items-center" type="submit" onClick={handleSearch}>
                <i className="fa fa-search bg-gray-100 p-3"></i>
            </button>
            </form>
            

            <div className="overflow-y-auto h-[80%] ">
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
                    {products.map((product) => (
                        <tr key={product.id} className="bg-white text-sm h-14">
                        <td className="p-3">{product.name}</td>
                        <td>
                            <img
                            className="h-10 w-10 inline rounded-4xl"
                            src={`/storage/${product.image}`}
                            alt={product.name}
                            />
                        </td>
                        <td>{product.big}</td>
                        <td>{product.medium}</td>
                        <td>{product.platter}</td>
                        <td>{product.tub}</td>
                        <td >
                            <div className="flex justify-center items-center gap-2 h-full">
                                
                                    <i className="fas fa-edit"></i> Edit
                               
                                
                                <button onClick={() => handleDelete(product.id)}
                                    className="bg-gray-100 text-red-600 h-8 w-20 flex justify-center items-center">
                                    <i className="fa fa-trash"></i> Delete
                                </button>
                            </div>
                           
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
                
        </div>
    )
}