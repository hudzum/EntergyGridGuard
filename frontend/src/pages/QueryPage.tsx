import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/NavBar";

export default function QueryPage() {
  const [filters, setFilters] = useState({
    assetType: "",
    condition: "",
    minPrice: "",
    maxPrice: "",
    location: [],
  });

  // Asset Types
  const assetTypes = ["Transformers", "Capcitors", "Insulators", "Wiring"];

  // Conditions
  const conditions = ["New", "Need Help", "Broken"];

  // Location Options
  const locations = [
    { label: "Within 15 miles", value: "15" },
    { label: "Within 30 miles", value: "30" },
    { label: "Within 60 miles", value: "60" },
  ];

  // Handle Select Change
  const handleSelectChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle Input Change
  const handleInputChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle Checkbox Change
  const handleCheckboxChange = (value) => {
    setFilters((prev) => {
      const updatedLocations = prev.location.includes(value)
        ? prev.location.filter((loc) => loc !== value)
        : [...prev.location, value];

      return { ...prev, location: updatedLocations };
    });
  };

  // Handle Search
  const handleSearch = () => {
    console.log("Filters Applied:", filters);
    const element = document.querySelector("#results");
    if (element) {
      element.className="inline" 
    }
    // Perform API search or filtering logic here
  };

  return (
    <div className="min-h-screen bg-zinc-300 flex flex-col w-full">
      <Navbar />
      <div className="min-h-screen bg-zinc-300 flex flex-row items-center m-8 w-full">
        <div>
          <Card className="w-75 mx-auto mt-10 m-10 p-6 shadow-lg bg-zinc-50 text-black border-t-10 border-rose-500">
            <CardContent className="space-y-4 text-black">
              <h2 className="text-xl font-semibold">Search Assets</h2>

              {/* Asset Type Dropdown */}
              <Select 
                onValueChange={(value) =>
                  handleSelectChange("assetType", value)
                }
                
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Asset Type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Condition Dropdown */}
              <Select
                onValueChange={(value) =>
                  handleSelectChange("condition", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((cond) => (
                    <SelectItem key={cond} value={cond}>
                      {cond} 
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Inputs */}
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min Price"
                  onChange={(e) =>
                    handleInputChange("minPrice", e.target.value)
                  }
                />
                <Input
                  type="number"
                  placeholder="Max Price"
                  onChange={(e) =>
                    handleInputChange("maxPrice", e.target.value)
                  }
                />
              </div>

              {/* Location Checkboxes */}
              <div className="space-y-2">
                <h3 className="text-md font-medium">Location</h3>
                {locations.map((loc) => (
                  <div key={loc.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={loc.value}
                      onCheckedChange={() => handleCheckboxChange(loc.value)}
                    />
                    <label htmlFor={loc.value} className="text-sm">
                      {loc.label}
                    </label>
                  </div>
                ))}
              </div>

              {/* Search Button */}
              <Button className="w-full" onClick={handleSearch}>
                Search
              </Button>
            </CardContent>
          </Card>
        </div>
        <div id = "results" className = "hidden">
          <Card className="border-violet-700 border-l-5 w-230  bg-zinc-50 text-black font-semibold flex flex-row justify-around my-4">
            <img src="./queryExample.jpg" className="h-17 l-0" />
            <div>
              <p>Pole_id : 2910384</p>

              <p>Coordinates (34.439, 4324.756)</p>

              <p>Asset Damage: Main Pole, Wiring</p>
            </div>

            <Button className="w-50 bg-violet-700 text-white">
              Detailed Analysis
            </Button>
          </Card>
          <Card className="border-violet-700 border-l-5 w-230  bg-zinc-50 text-black font-semibold flex flex-row justify-around my-4">
            <img src="./queryExample.jpg" className="h-17 l-0" />
            <div>
              <p>Pole_id : 2910384</p>

              <p>Coordinates (34.439, 4324.756)</p>

              <p>Asset Damage: Main Pole, Wiring</p>
            </div>

            <Button className="w-50 bg-violet-700 text-white">
              Detailed Analysis
            </Button>
          </Card>
          <Card className="border-violet-700 border-l-5 w-230  bg-zinc-50 text-black font-semibold flex flex-row justify-around my-4">
            <img src="./queryExample.jpg" className="h-17 l-0" />
            <div>
              <p>Pole_id : 2910384</p>

              <p>Coordinates (34.439, 4324.756)</p>

              <p>Asset Damage: Main Pole, Wiring</p>
            </div>

            <Button className="w-50 bg-violet-700 text-white">
              Detailed Analysis
            </Button>
          </Card>
          <Card className="border-violet-700 border-l-5 w-230  bg-zinc-50 text-black font-semibold flex flex-row justify-around my-4">
            <img src="./queryExample.jpg" className="h-17 l-0" />
            <div>
              <p>Pole_id : 2910384</p>

              <p>Coordinates (34.439, 4324.756)</p>

              <p>Asset Damage: Main Pole, Wiring</p>
            </div>

            <Button className="w-50 bg-violet-700 text-white">
              Detailed Analysis
            </Button>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
