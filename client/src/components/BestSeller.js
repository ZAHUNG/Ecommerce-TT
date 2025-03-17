import React,{useState, useEffect} from 'react'
import { apiGetProducts } from '../apis/product'
import  Product  from './Product'
import Slider from 'react-slick'



const tabs = [
    {id:1, name: 'Best Sellers'},
    {id:2, name: 'New Arrivals'},
]
const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1
  };

const BestSeller = () => {
    const [bestSellers, setBestSellers] = useState(null)
    const [newProducts, setNewProducts] = useState(null)
    const[ativeTab, setActiveTab] = useState(1)
    const [products, setProducts] = useState(null)



  const fetchProducts = async () => {
    const response = await Promise.all([apiGetProducts({sort:"-sold"}), apiGetProducts({sort:"-createdAt"})])
    if (response[0]?.success) setBestSellers(response[0]?.products)
    if (response[1]?.success) setNewProducts(response[1]?.products)
      setProducts(response[0]?.products)
    }

  useEffect(() => {
    fetchProducts()

  }, [])
useEffect(() => {
  if (ativeTab === 1) setProducts(bestSellers)
  if (ativeTab === 2) setProducts(newProducts)

}, [ativeTab])
  return (
    <div>
      <div className='flex text-[20px gap-8 pb-4 border-b-2 border-main' >
       {tabs.map( el => (
            <span 
                key={el.id} 
                className={'font-semibold capitalize border-r cursor-pointed text-gray-900 ${ativeTab === el.id ? "text-black" : ""}'} 
                    onClick={() => setActiveTab(el.id)}
                    >{el.name}</span>

         ))}
      </div>
      <div className='mt-4 mx-[-5px] '>
          <Slider {...settings}>
         {products?.map(el  => (
            <Product 
            key={el._id} 
            productData={el}
            isNew={ ativeTab === 1 ? false : true} />
         ))}
    </Slider>
      </div>
    </div>
  )
}
export default BestSeller