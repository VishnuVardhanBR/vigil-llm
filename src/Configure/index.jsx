import React, { useState, useRef, useEffect } from 'react';
import Webcam from "react-webcam";
import { FaArrowCircleRight, FaPencilAlt  } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import Nav from "../Components/Nav"
import { MdDangerous } from "react-icons/md";

import { useNavigate } from 'react-router-dom';

function ZoneSafety() {

  const [points, setPoints] = useState([]);
  const [rectangle, setRectangle] = useState([]);
  const navigate = useNavigate();


  const handleClick = (e) => {
    if (points.length >= 4) return; // stop after 4 clicks

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPoints((prev) => [...prev, { x, y }]);
  };

  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);

  const capture = () => {
    const screenshot = webcamRef.current.getScreenshot();
    setImage(screenshot);
  };



  return (
    <div className="h-full w-full flex bg-gray-100  p-5">
<Nav current="configure" />
      <div className='w-3/6 '>
        <div className='w-full rounded-lg shadow-2xl bg-linear-to-r from-qual to-qualend p-5'>
          <div className='w-full rounded-lg '>
            {!image ?
              (<Webcam

                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full rounded-lg"
              />) : (
                <div className="w-full h-full relative" onClick={handleClick}
                >

                  <img src={image} alt="Captured" className="w-full rounded-lg" />
                  <svg
                    width="100%"
                    height="100%"
                    style={{ position: "absolute", top: 0, left: 0 }}
                  >
                    {/* Draw dots */}
                    {points.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r={4} fill="red" />
                    ))}

                    {/* Draw polygon only when 4 points selected */}
                    {points.length === 4 && (
                      <polygon
                        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                        fill="rgba(0, 128, 255, 0.3)"
                        stroke="blue"
                        strokeWidth="2"
                      />
                    )}
                  </svg>
                </div>
              )}
          </div>
        </div>
        <div className='w-full rounded-lg shadow-2xl bg-white p-5 mt-5 text-qualmain font-semibold text-2xl'>
        
Zone Detection: Detect unwated entry in dangerous Zones.

        </div>
      </div>
      <div className='w-2/6 pl-5'>

      {image? <button className='
         w-full bg-white h-1/8 rounded-lg text-green-300 text-2xl flex p-6 mb-5 font-semibold px-12 shadow-2xl'
          onClick={capture}>
          Image Captured Successfully <FaCircleCheck className='ml-8 mt-1'/></button> :
        (<button className='
        cursor-pointer w-full bg-white h-1/8 rounded-lg text-qualmain text-2xl flex p-6 mb-5 font-semibold px-12 shadow-2xl'
          onClick={capture}>
          Capture zone to Annotate <FaArrowCircleRight className='ml-8 mt-1'/></button>)}

          {points.length === 4 ? <button className='
         w-full bg-white h-1/8 rounded-lg text-green-300 text-2xl flex p-6 mb-5 font-semibold px-12 shadow-2xl'
          onClick={capture}>
          Bounding box selected <FaCircleCheck className='ml-8 mt-1'/></button> :
        (<button className='
        w-full bg-white h-1/8 rounded-lg text-qualmain text-2xl flex p-6 mb-5 font-semibold pl-8 shadow-2xl'
          onClick={capture}>
          Click on the image to Annotate <FaPencilAlt className='ml-4 mt-1'/></button>)}
          <div className='h-6/8 bg-white rounded-lg shadow-2xl'>

            </div>

      </div>

    </div>
  );
}

export default ZoneSafety;


