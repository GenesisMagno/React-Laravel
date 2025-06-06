import React, { useState, useEffect } from "react";
import MainLayout from "../../Layouts/MainLayout";
import { Link } from '@inertiajs/react';

export default function Viewproduct({ product,user}) {
    const [productPrice, setProductPrice] = useState(product.tub);
    const [quantity, setQuantity] = useState(1);
    const [totalPrice, setTotalPrice] = useState(product.tub);

    const [selectedSize, setSelectedSize] = useState("tub");

    useEffect(() => {
        if (product[selectedSize]) {
            setProductPrice(product[selectedSize]);
            setTotalPrice(product[selectedSize] * quantity);
        }
    }, [selectedSize, quantity]);
    return (
        <div className="w-full flex justify-center m-auto h-full items-center ">
            <div className="h-4/5 w-[50%] flex ">
                <img src={`/storage/${product.image}`} alt="" className="w-full aspect-[4/3] m-auto object-fill"/>
            </div>
            <div className="h-3/5 w-[40%] justify-center text-center ">
                <p className="text-4xl m-auto mb-3 pt-10 font-bold">{product.name}</p>
                <p className="text-xl m-auto font-semibold">₱{productPrice}</p>
                <ul className="flex flex-wrap justify-center gap-3 my-7">
                    {["big", "medium", "platter", "tub"].map((size) => (
                        <li key={size}>
                            <button
                                onClick={() => setSelectedSize(size)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200
                                    ${
                                        product[size] == null
                                        ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-500"
                                        : productPrice === product[size]
                                            ? "bg-gray-300 text-black"
                                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                disabled={product[size] == null}
                            >
                                {size.charAt(0).toUpperCase() + size.slice(1)}
                            </button>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-center items-center mb-9">
                    <div className="mr-2 font-medium">Quantity</div>

                    <button
                        onClick={() => {
                            if (quantity > 1) setQuantity(quantity - 1);
                        }}
                        className="w-6 h-8 flex items-center justify-center bg-gray-300 "
                    >
                        <i className="fa-solid fa-minus text-sm"></i>
                    </button>

                    <div className="w-10 h-8 flex items-center justify-center bg-gray-200 text-lg">
                        {quantity}
                    </div>

                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-6 h-8 flex items-center justify-center bg-gray-300 "
                    >
                        <i className="fa-solid fa-plus text-sm"></i>
                    </button>
                </div>

                {/* Display Total Price */}
                <p className="text-lg font-semibold mb-6">Total: ₱{totalPrice}</p>

                <Link href="/order" className="bg-green-800 text-white px-14 py-3 mt-4 text-center text-xl">
                    Order Now
                </Link>
            </div>
        </div>
    );
}

Viewproduct.layout = (page) => <MainLayout auth={page.props.auth} children={page}/>;
