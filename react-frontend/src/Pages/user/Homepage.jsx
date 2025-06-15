import { Link } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";

export default function Homepage() {

    const {data,isLoading,isError}= useProducts();
    const products= data?.products;

    return (
        <div className="w-full" id="Container">
            <div className="mb-12">
                <label className="text-[2.50rem] font-sans font-medium antialiased ">Products</label>
            </div>

            <div className="h-auto w-full m-auto mt-3 flex flex-wrap justify-center gap-x-16 gap-y-14 ">
                {products?.map((product) => (
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
                ))}
            </div>
        </div>
    );
}

