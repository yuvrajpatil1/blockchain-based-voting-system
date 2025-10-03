import React from "react";
import "./Loader.css";

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen w-screen bg-black">
      <div className="bg-black p-4 lg:p-8 rounded-xl">
        <div className="text-gray-400 text-lg lg:text-2xl font-medium flex items-center h-10 px-2 rounded-lg">
          <span className="mr-2">loading your</span>
          <div className="relative overflow-hidden h-full">
            <div
              className="flex flex-col h-full animate-spin-words"
              style={{
                animation: "spinWords 3s infinite",
              }}
            >
              <span className="block h-full pl-1 text-orange-500 leading-10">
                votes...
              </span>
              <span className="block h-full pl-1 text-orange-500 leading-10">
                elections...
              </span>
              <span className="block h-full pl-1 text-orange-500 leading-10">
                votes...
              </span>
              <span className="block h-full pl-1 text-orange-500 leading-10">
                elections...
              </span>
              <span className="block h-full pl-1 text-orange-500 leading-10">
                votes...
              </span>
              <span className="block h-full pl-1 text-orange-500 leading-10">
                elections...
              </span>
              <span className="block h-full pl-1 text-orange-500 leading-10">
                votes...
              </span>
              <span className="block h-full pl-1 text-orange-500 leading-10">
                elections...
              </span>
              <span className="block h-full pl-1 text-orange-500 leading-10">
                votes...
              </span>
              <span className="block h-full pl-1 text-orange-500 leading-10">
                elections...
              </span>
            </div>
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(to bottom, #000 10%, transparent 30%, transparent 70%, #000 90%)",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
