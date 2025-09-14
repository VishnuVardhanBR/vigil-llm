import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoHome } from 'react-icons/io5';
import { IoSettings } from "react-icons/io5";
import {LuScreenShare} from "react-icons/lu"

const Nav = ({ current = null }) => {
  const navigate = useNavigate();

  return (
    <div className='w-1/6 pr-5'>
      <button 
        className={`cursor-pointer w-full bg-white h-20 rounded-lg text-qualmain text-2xl flex p-6 mb-5 font-semibold ${current === 'home' ? 'bg-linear-to-r from-qual to-qualend text-white' : ''}`}
        onClick={() => navigate('/')}
      >
        <IoHome className='mr-6 mt-1' />
        Home
      </button>
      <button 
        className={`cursor-pointer w-full bg-white h-20 rounded-lg text-2xl flex p-6 mb-5 text-qualmain font-semibold ${current === 'configure' ? 'bg-linear-to-r from-qual to-qualend text-white' : ''}`}
        onClick={() => navigate('/configure')}
      >
        <IoSettings className='mr-6 mt-1'/> 
        Configure
      </button>
      <button 
        className={`cursor-pointer w-full bg-white h-20 rounded-lg text-2xl flex p-6 mb-5 text-qualmain font-semibold ${current === 'live' ? 'bg-linear-to-r from-qual to-qualend text-white' : ''}`}
        onClick={() => navigate('/live')}
      >
        <LuScreenShare className='mr-6 mt-1'/> 
        Live Feed
      </button>
    </div>
  );
};

export default Nav;