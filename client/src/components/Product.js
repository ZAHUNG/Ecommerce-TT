import React from 'react';
import { formatMoney } from '../ultils/helper';
import hot from '../assets/hot.png';
import newlabel from '../assets/newlabel.png';
import '../css/product.css';



const Product = ({productData, isNew}) => {
  return (
    <div className='w-full text-base  px-[5px]'>
      <div className='w-full border p-[15px] flex flex-col items-center '>
         <div className='w-full relative'>
            <img 
              src= {productData?.thumb || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6UecsAH_5iqVP24S6yyJrwCV47kk9lRuypg&s' } 
              alt="" 
              className='w-[243px] h-[full] object-cover '
              />
            <img src= {isNew ? newlabel: hot} alt="" className='absolute top-[-23px] left-[-30px] w-[-70px] h-[50px] object-cover '/>  
          
            </div>
        <div className='flex flex-col mt-[15px] items-start w-full '>
            <span className='line-clamp-1'>{productData?.title}</span>
            <span>{`${formatMoney(productData?.price)}`}</span></div>
      </div>
    </div>
  )
}

export default Product;