import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/NavBar";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/tableFilterComps/data-table";
import { columns } from "@/components/tableFilterComps/columns";

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
import { Car } from "lucide-react";

const QueryPage = () => {
  type Pole = {
    id: number;
    status: string;
    date: string;
    components: {};
  };
  const [allPoles, setAllPoles] = useState<Pole[]>([]); //Every Pole
  const [poles, setPoles] = useState<Pole[]>([]); //Poles Displayed based on filters
  //const [poles, setPoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    assetType: "",
    condition: "",
    minPrice: "",
    maxPrice: "",
    location: [],
  });

  //Determines an overall condition of the pole
  function getOverallCondition(components) {
    const conditionCounts = { bad: 0, good: 0, unknown: 0 };

    for (const key in components) {
      if (components[key].condition in conditionCounts) {
        conditionCounts[components[key].condition]++;
      }
    }

    // Determine the condition with the highest count
    let overallCondition = Object.keys(conditionCounts).reduce((a, b) =>
      conditionCounts[a] > conditionCounts[b] ? a : b
    );

    return overallCondition;
  }
  // Fetching Data
  useEffect(() => {
    const fetchImagesMetadata = async () => {
      console.log("Attempting to fetch Pole Data ");
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:80/api/images-meta`);
        if (response.ok) {
          const data = await response.json();

          if (data.images && data.images.length > 0) {
            console.log("Original Array");
            console.log(data.images);

            const polesWithComponents = data.images.filter(
              (pole) =>
                Object.keys(pole.components).length > 0 &&
                pole.components != "{}"
            );
            console.log("No Blank Components");
            console.log(polesWithComponents);

            const finalPoles = polesWithComponents.map((pole) => {
              let overallCondition = getOverallCondition(pole.components);
              let newPole: Pole = {
                id: pole.id,
                status: overallCondition,
                date: pole.time_created,
                components: pole.components,
              };
              return newPole;
            });
            console.log("New Typed Poles");

            setPoles(finalPoles);
            setAllPoles(finalPoles);
          } else {
            setPoles([]);
          }
        } else {
          setError("Error fetching image metadata");
        }
      } catch (error) {
        setError(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchImagesMetadata();
  }, []);

  if (loading)
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Loading image metadata...</CardTitle>
        </CardHeader>
      </Card>
    );

  if (error)
    return (
      <Card className="w-full border-red-200">
        <CardHeader className="bg-red-50 text-red-700">
          <CardTitle>Error</CardTitle>
          <CardDescription className="text-red-600">{error}</CardDescription>
        </CardHeader>
      </Card>
    );

  //Filter

  // Asset Types
  const assetTypes = [
    "Overall",
    "Pole",
    "Crossarms",
    "Guy Wires",
    "Insulators",
    "Primary Wires",
    "Street Lights",
    "Transformers",
  ];

  // Conditions
  const conditions = ["Good", "Bad", "Unknown", "Any"];


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
    let assetType = filters.assetType.toLowerCase();
    let condition = filters.condition.toLowerCase();
    if (assetType == "overall" && condition == "any") {
      setPoles(allPoles);
    } else if (assetType == "overall") {
      console.log("overall with filter", condition);
      const newPoles = allPoles.filter((pole) => pole.status == condition);
      setPoles(newPoles);
    } else if (condition == "any") {
      setPoles(allPoles);
    } else {
      console.log("Filtering this ", assetType, " ", condition);

      const newPoles = allPoles.filter(
        (pole) =>
          pole.components[assetType] &&
          pole.components[assetType].condition == condition
      );
      setPoles(newPoles);
    }

    const element = document.querySelector("#results");

    if (element) {
      element.className = "inline";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-300 flex flex-col w-full">
      <Navbar />
      <div className="flex justify-between m-2 align-center ">
        <Card className="shadow-lg bg-zinc-50 text-black border-1 border-rose-500 w-75 h-75 flex-none p-2">
          <CardContent className="p-4 space-y-4 text-black">
            <h2 className="text-xl font-semibold">Search Assets</h2>

            <Select
              onValueChange={(value) => handleSelectChange("assetType", value)}
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

            <Select
              onValueChange={(value) => handleSelectChange("condition", value)}
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

          

          
            <Button
              className="w-full bg-rose-500 text-white"
              onClick={handleSearch}
            >
              Search
            </Button>
          </CardContent>
        </Card>

        <Card className="border-violet-700 border-t-4 w-250 flex-1">
          <h2 className="text-2xl font-semibold">Utility Pole Inventory</h2>
          <DataTable columns={columns} data={poles} />
        </Card>
      </div>
    </div>
  );
};

export default QueryPage;
