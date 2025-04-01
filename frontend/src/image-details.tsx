import React, { useState, useEffect } from 'react';

interface ImageDetailsProps {
  imageId: number;
  imageData: {
    id: number;
    components: object;
    time_created: string;
  };
  onClose: () => void;
}

const ImageDetails: React.FC<ImageDetailsProps> = ({ imageId, imageData, onClose }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImage() {
      try {
        const response = await fetch(`/api/images/${imageId}/data`);
        if (response.ok) {
          // Get the binary response as a Blob
          const blob = await response.blob();
          // Create an object URL for the Blob to use as an image source
          const imageUrl = URL.createObjectURL(blob);
          setImageSrc(imageUrl);
        } else {
          console.error('Error fetching image:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    }

    fetchImage();

    // Cleanup the URL when the component is unmounted or when the image changes
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageId]);

  if (!imageSrc) {
    return <div>Loading image...</div>;
  }

  return (
    <div>
      <button onClick={onClose}>Close</button>
      <h2>Image {imageData.id} Details</h2>
      <img src={imageSrc} alt={`Image ${imageData.id}`} width="400" />
      <p>
        <strong>Components:</strong> {JSON.stringify(imageData.components, null, 2)}
      </p>
      <p>
        <strong>Created At:</strong> {new Date(imageData.time_created).toLocaleString()}
      </p>
    </div>
  );
};

export default ImageDetails;
