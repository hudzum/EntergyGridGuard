import { useState, useEffect } from 'react';
import './App.css';
import ImageDetails from './image-details';
import Upload from './upload'

function App() {
  const [images, setImages] = useState<{ id: number; time_created: string }[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [imageDetails, setImageDetails] = useState<{
    id: number;
    image: string;
    components: object;
    time_created: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch images (just the id and time_created) to list them
  useEffect(() => {
    fetch('http://localhost:80/api/images')
      .then((response) => response.json())
      .then((data) => {
        if (data.images) {
          setImages(data.images);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching images:', error);
        setLoading(false);
      });
  }, []);

  const handleImageClick = (imageId: number) => {
    setSelectedImageId(imageId);
    // Fetch image details only when the user clicks
    fetch(`http://localhost:80/api/images/${imageId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          setImageDetails(data); // Store the full details
        }
      })
      .catch((error) => console.error('Error fetching image details:', error));
  };

  const handleCloseImageDetails = () => {
    setSelectedImageId(null); // Close image details view
    setImageDetails(null); // Reset image details
  };

  return (
    <div>
      <Upload />
      <h1>Image List</h1>

      {/* Loading state */}
      {loading ? (
        <p>Loading images...</p> // Show a loading message while fetching images
      ) : (
        <div>
          {images.length > 0 ? (
            images.map((img) => (
              <div key={img.id}>
                <p onClick={() => handleImageClick(img.id)}>
                  <strong>Image {img.id}</strong> (Created: {img.time_created})
                </p>
              </div>
            ))
          ) : (
            <p>No images found.</p>
          )}
        </div>
      )}

      {/* Conditionally render ImageDetails */}
      {imageDetails && (
        <ImageDetails
          imageId={imageDetails.id}
          imageData={imageDetails}
          onClose={handleCloseImageDetails}
        />
      )}
    </div>
  );
}

export default App;