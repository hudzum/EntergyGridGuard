import { Loader } from "lucide-react"
export default function UploadProcessing ({imageId, setStatus, setImageDetails, setImageSrc}) {
    const fetchImageDetails = async (imageId: number) => {
        console.log("Fetching Image Details");
        try {
          const response = await fetch(`/api/images/${imageId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.id) {
                
              setImageDetails(data);
              
              fetchImage(data.id);
              console.log(data);
            }
          } else {
            console.error('Error fetching image details:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching image details:', error);
        }
      };
      
      const fetchImage = async (imageId: number) => {
        console.log("Fetching Image Src");
        try {
          const response = await fetch(`/api/images/${imageId}/data`);
          if (response.ok) {
            // Get the binary response as a Blob
            const blob = await response.blob();
            // Create an object URL for the Blob to use as an image source
            const imageUrl = URL.createObjectURL(blob);
            setImageSrc(imageUrl);
            setStatus("result")
          } else {
            console.error('Error fetching image:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching image:', error);
        }
      };

    fetchImageDetails(imageId);

    return <div className ="text-black  flex flex-col items-center justify-center space-y-4 p-8">
        
        <div className="animate-spin">
                <Loader className="h-12 w-12 text-violet-700" />
              </div>
    <div className="text-lg font-semibold">Analyzing Pole Components for Damage with AI...</div>
          
    
    </div>
}