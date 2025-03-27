import React from 'react';
import { useCarousel } from "@/components/ui/carousel";

export function CarouselDots() {
  const { api } = useCarousel();
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    api.on('select', onSelect);
    onSelect();

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  if (!api) return null;

  const totalSlides = api.scrollSnapList().length;

  return (
    <div className="flex space-x-2">
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          onClick={() => api.scrollTo(index)}
          className={`
            w-2 h-2 rounded-full transition-all duration-300
            ${index === selectedIndex 
              ? 'bg-rose-500 w-4' 
              : 'bg-rose-200 hover:bg-rose-300'}
          `}
        />
      ))}
    </div>
  );
}

export default CarouselDots;