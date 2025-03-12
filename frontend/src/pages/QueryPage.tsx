import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/NavBar';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from '@/components/tableFilterComps/data-table';
import { columns } from '@/components/tableFilterComps/columns';




const QueryPage = () => {
  type Pole ={
    id: number,
    status: string,
    date: string,
    components:{},
}
  const [poles, setPoles] = useState<Pole[]>([]);
  //const [poles, setPoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      console.log("Attempting to fetch Pole Data ")
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:80/api/images-meta`);
        if (response.ok) {
          const data = await response.json();


          if (data.images && data.images.length > 0) {

            console.log("Original Array")
            console.log(data.images);

            const polesWithComponents = (data.images).filter((pole) => 
            Object.keys(pole.components).length > 0 && pole.components != '{}')
            console.log("No Blank Components")
            console.log(polesWithComponents)

            const finalPoles = polesWithComponents.map((pole) => 
              {
              let overallCondition = getOverallCondition(pole.components)
              let newPole : Pole = {
                id: pole.id,
                status: overallCondition,
                date: pole.time_created,
                components: pole.components
              }
              return newPole
            } )
            console.log("New Typed Poles")
            
            setPoles(finalPoles)
          
          } else {
            setPoles([]);
          }
        } else {
          setError('Error fetching image metadata');
        }
      } catch (error) {
        setError(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchImagesMetadata();
  }, []);

  

  

  if (loading) return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle>Loading image metadata...</CardTitle>
      </CardHeader>
    </Card>
  );
  
  if (error) return (
    <Card className="w-full border-red-200">
      <CardHeader className="bg-red-50 text-red-700">
        <CardTitle>Error</CardTitle>
        <CardDescription className="text-red-600">{error}</CardDescription>
      </CardHeader>
    </Card>
  );

  
  return (
    <div className="min-h-screen b  g-zinc-300 flex flex-col w-full">
      <Navbar />
      <div className="min-h-screen flex flex-row items-center m-8 w-full">
        <div>

      
        </div>
        <div id = "results" >
            

            {/*Data Table*/}
          <DataTable columns = {columns} data = {poles}/>

        </div>
        
      </div>
    </div>


  );
  
};

export default QueryPage;