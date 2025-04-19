import React, {useEffect, useState} from "react";
import {Navbar} from "@/components/NavBar";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {DataTable} from "@/components/tableFilterComps/data-table";
import {columns} from "@/components/tableFilterComps/columns";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Button} from "@/components/ui/button";

const QueryPage = () => {
  type Pole = {
    id: number;
    status: string;
    date: string;
    components: {}; // This can be an empty object if no components are provided
    thumbnail?: string; // Optional thumbnail for hover
    latitude?: number | null;
    longitude?: number | null;
  };

  const [allPoles, setAllPoles] = useState<Pole[]>([]); // All poles
  const [poles, setPoles] = useState<Pole[]>([]); // Poles to display based on filters
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    assetType: "",
    condition: "",
    minPrice: "",
    maxPrice: "",
    location: '',
  });

  const [hoveredPoleId, setHoveredPoleId] = useState<number | null>(null);

  // Determines the overall condition of the pole
  function getOverallCondition(components: {}) {
    if (Object.keys(components).length === 0) {
      return "Unknown"; // If no components, default to 'Unknown' status
    }

    const conditionCounts = { bad: 0, good: 0, unknown: 0 };

    for (const key in components) {
      if (components[key].condition in conditionCounts) {
        conditionCounts[components[key].condition]++;
      }
    }

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
        const response = await fetch(`/api/images-meta`);
        if (response.ok) {
          const data = await response.json();

          if (data.images && data.images.length > 0) {
            console.log("Original Array");
            console.log(data.images);

            const finalPoles = data.images.map((pole) => {
              let overallCondition = getOverallCondition(pole.components);
              let newPole: Pole = {
                id: pole.id,
                status: overallCondition,
                date: pole.time_created,
                components: pole.components || {}, // Ensure components is always an object
                thumbnail: pole.thumbnail || undefined, // Placeholder
                latitude: pole.latitude || null,
                // todo same hack as in other place
                longitude: pole.longitude && -Math.abs(pole.longitude) || pole.longitude || null,
              };
              return newPole;
            });
            console.log("New Typed Poles");

            setPoles(finalPoles);
            setAllPoles(finalPoles);
          } else {
            setPoles([]); // Set to empty if no poles are available
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

  // Filter logic...
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

  const conditions = ["Good", "Bad", "Unknown", "Any"];

  const handleSelectChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (value) => {
    setFilters((prev) => {
      const updatedLocations = prev.location.includes(value)
        ? prev.location.filter((loc) => loc !== value)
        : [...prev.location, value];

      return { ...prev, location: updatedLocations };
    });
  };

  const handleSearch = () => {
    console.log("Filters Applied:", filters);
    let assetType = filters.assetType.toLowerCase();
    let condition = filters.condition.toLowerCase();
    const location = filters.location;

    let filteredPoles = allPoles;

    if (assetType === "overall" && condition === "any") {
      filteredPoles = allPoles;
    } else if (assetType === "overall") {
      filteredPoles = allPoles.filter((pole) => pole.status === condition);
    } else if (condition === "any") {
      filteredPoles = allPoles;
    } else if (assetType && condition) {
      filteredPoles = allPoles.filter(
          (pole) =>
              pole.components[assetType] &&
              pole.components[assetType].condition === condition
      );
    }

    if (location === 'Has Location') {
      filteredPoles = filteredPoles.filter((pole) => pole.latitude && pole.longitude);
    } else if (location === 'No Location') {
      filteredPoles = filteredPoles.filter((pole) => !(pole.latitude || pole.longitude));
    }

    setPoles(filteredPoles);

    const element = document.querySelector("#results");

    if (element) {
      element.className = "inline";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-300 flex flex-col w-full ">
      <Navbar />
      <div className="flex justify-between m-10 align-center ">
        <Card className="border-violet-700 border-t-8  w-250 flex-1">
          <h2 className="text-2xl font-semibold">Utility Pole Inventory</h2>

          {/*Search/Filter by Assets Section */}
          <Card style={{width: 'max-content'}} className="flex flex-col shadow-lg bg-zinc-50 text-black border-1 border-rose-500 p-2 ml-10 w-4/12">
            <CardContent className="p-4 space-y-4 text-black" style={{width: 'max-content'}}>
              <h2 className="text-xl font-semibold">Search Assets</h2>
              <div className="flex flex-row gap-4" style={{width: 'max-content'}}>

                <div>
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
                </div>

                <div>
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
              </div>

                <div>
                  <Select
                      onValueChange={(value) =>
                          handleSelectChange("location", value)
                      }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Has Location', 'No Location', 'Any'].map((cond) => (
                          <SelectItem key={cond} value={cond}>
                            {cond}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Button
                      className=" bg-rose-500 text-white flex-1"
                      onClick={handleSearch}
                  >
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/*hover image */}
          <div className="relative mx-5">
            {/* Displaying Thumbnail on Hover */}
            {hoveredPoleId && (
              <div
                className="absolute bg-white p-2 shadow-md rounded"
                style={{
                  top: "10px",
                  left: "10px",
                  zIndex: 10,
                }}
              >
                <img
                  src={
                    poles.find((pole) => pole.id === hoveredPoleId)
                      ?.thumbnail || ""
                  }
                  alt="Thumbnail"
                  className="h-24 w-24 object-cover"
                />
              </div>
            )}

            {/*Actual Table*/}
            <DataTable
              columns={columns}
              data={poles}
              onRowHover={(id) => setHoveredPoleId(id)}
              onRowLeave={() => setHoveredPoleId(null)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QueryPage;
