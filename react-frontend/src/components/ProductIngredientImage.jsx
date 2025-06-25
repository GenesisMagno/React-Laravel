import { useEffect, useState } from "react";

export default function ProductIngredientImage({ keyword }) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=1`,
          {
            headers: {
              Authorization: 'tjIA8IWUSpokuZrQmCBNtAQpo8Gi2IHF4IWAV9p6IBDHpoig0j3i3nMe', // ✅ Uses .env key
            },
          }
        );

        const data = await response.json();

        if (data.photos && data.photos.length > 0) {
          setImageUrl(data.photos[0].src.medium);
        } else {
          setImageUrl(`https://placehold.co/150x150?text=${keyword}`);
        }
      } catch (error) {
        console.error("Error fetching from Pexels:", error);
        setImageUrl(`https://placehold.co/150x150?text=${keyword}`);
      }
    };

    fetchImage();
  }, [keyword]);

  return (
    <img
      src={imageUrl}
      alt={keyword}
      className="w-full h-full object-cover rounded shadow"
    />
  );
}
