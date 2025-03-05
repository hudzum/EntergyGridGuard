import React from "react";
import { Navbar } from "./components/NavBar";
import { Button } from "./components/ui/button";

function App() {
  return (
    <div className="min-h-screen bg-zinc-300 flex flex-col w-full">
      {/* Navbar should be outside the main content container */}
      <Navbar />
      
      {/* Main content section */}
      <main className="flex-grow flex items-center justify-center w-full px-4 py-8">
        <div className="bg-zinc-50  rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col items-center py-12 px-4 md:px-8 lg:px-12">
            {/* Hero content */}
            <div className="text-center w-full max-w-3xl mx-auto mb-12">
              <h1 className="text-3xl md:text-5xl font-bold mb-6 text-black">
                <span className="text-transparent bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text">
                  ERIC
                </span>{" "}
              powered by Entergy 
              </h1>
              <p className="text-zinc-600 text-lg mb-8 max-w-2xl mx-auto">
              Harnessing AI to Help Entergy Technicians Quickly Locate and Repair Damaged Power Poles with Precision and Efficiency.
              </p>
              <Button className="bg-rose-500">
                Learn More
              </Button>
            </div>
            
            {/* Hero image */}
            <div className="relative w-full max-w-4xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-[90%] h-40 bg-blue-500/30 rounded-full blur-3xl"></div>
              <img
                src="./Hero.png"
                alt="dashboard"
                className="relative w-full rounded-lg border border-gray-200 shadow-lg"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
export default App;