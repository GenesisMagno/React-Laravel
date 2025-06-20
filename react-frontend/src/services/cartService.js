import api from "../axios";

export const getCart = async(id)=>{
    const {data} = await api.get(`/cart`)
}