import React from "react";
import MainLayout from "../../Layouts/MainLayout";
import { Link } from '@inertiajs/react';

export default function Homepage({ products}) {
    return (
        <div className="w-full" id="Container">
            <div className="mb-12">
                <label className="text-4xl font-sans font-medium antialiased ">Products</label>
            </div>

            <div className="h-auto w-full m-auto mt-3 flex flex-wrap justify-center gap-x-16 gap-y-10 ">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white w-[25%] lg:h-90  text-center shadow rounded"
                    >
                        <Link href={`/viewproduct/${product.id}`}>
                            <img
                                src={`/storage/${product.image}`}
                                alt={product.name}
                                className="h-4/5 w-full object-cover mb-4"
                            />
                            <div>
                                <span className="text-xl font-medium mr-3">{product.name}</span>
                                <span className="text-sm font-medium">₱-{product.tub}</span>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

Homepage.layout = (page) => <MainLayout auth={page.props.auth} children={page}/>;
