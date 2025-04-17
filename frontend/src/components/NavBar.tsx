import { NavLink } from "react-router";

import { UtilityPole, Earth, ImageUp } from "lucide-react";
// Import shadcn components
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";


export function Navbar() {
  

  return (
    <div className=" drop-shadow-lg absolute top-0  sticky w-full border-b bg-zinc-50 backdrop-blur flex flex-row items-center justify-between px-6 h-17 z-50">

          <div className = "">
          <NavLink to="/" className="">
          <img src="./Entergy.png" alt="Object Detected Pole" className = "h-[100px]"/> 
          </NavLink>
          </div>
          <div className ="text-black font-bold flex items-center space-x-10">
          <NavigationMenu >
            <NavigationMenuList className="space-x-8">
              <NavigationMenuItem>
                <NavLink to="/map">
                  Map 
                </NavLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavLink to="/query">
                    Query
                </NavLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavLink to="/upload">
                    Upload
                </NavLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        

          </div>
      
    </div>
    
  )
}

export function IconRow() {
  return (
    <div className="w-full  py-6 px-4">
      <h2 className="text-xl font-bold text-center mb-6">Quick Links</h2>
      {/* Icon Cards */}
      <div className="max-w-4xl mx-auto flex justify-between">
        {/* Home Icon Card */}
        <NavLink to="/query" className="flex flex-col items-center w-1/3 mx-4 p-4 bg-white rounded-lg shadow-md hover:bg-blue-50 transition-colors">
          <UtilityPole className="h-12 w-12 text-black-600 mb-2" />
          <span className="text-lg font-medium">Inventory</span>
          <p className="text-sm text-rose-500 text-center mt-1">Filter database and find Poles </p>
        </NavLink>
        
        {/* Map Icon Card */}
        <NavLink to="/map" className="flex flex-col items-center w-1/3 mx-4 p-4 bg-white rounded-lg shadow-md hover:bg-blue-50 transition-colors">
          <Earth className="h-12 w-12 text-black-600 mb-2" />
          <span className="text-lg font-medium">Map</span>
          <p className="text-sm text-rose-500 text-center mt-1">Explore geographic data on our map</p>
        </NavLink>
        
        {/* Upload Icon Card */}
        <NavLink to="/upload" className="flex flex-col items-center w-1/3 mx-4 p-4 bg-white rounded-lg shadow-md hover:bg-blue-50 transition-colors">
          <ImageUp className="h-12 w-12 text-black-600 mb-2" />
          <span className="text-lg font-medium">Upload</span>
          <p className="text-sm text-rose-500 text-center mt-1">Upload new Images and Analzye data </p>
        </NavLink>
      </div>
    </div>
  );
}
