import api from "../axios";

export const getCart = async()=>{
    const {data} = await api.get(`/cart`);
    return data;
}

export const addCartItem = async(cartItem)=>{
    const {data} = await api.post(`/cart/add/`,cartItem);
    return data;
}

export const updateQuantity = async(cartItem)=>{
    const {data} = await api.post(`/cart/update-quantity`, cartItem);
    return data;
}

export const removeCartItem = async(cartItem)=>{
    const {data} = await api.post(`/cart/remove/`, cartItem);
    return data;
}