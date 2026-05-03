import { useState, useRef } from "react";
import axios from "axios";
import useClickOutside from "../../hook/ClickOutside";

function LocationAutocomplete({ formData, setFormData, onBlur }) {
  const [suggestions, setSuggestions] = useState([]);
  const API_KEY = "7bd9ee841c2b406e89120e889a173c08";
  const wrapperRef = useClickOutside(() => {
    setSuggestions([]);
  });
  const fetchIdRef = useRef(0);

  const handleInput = async (e) => {
    const value = e.target.value;

    if (!value) {
      const cleared = {
        ...formData,
        location: "",
        lat: null,
        lon: null,
      };

      setFormData(cleared);
      setSuggestions([]);
      if (onBlur) {
        setTimeout(() => onBlur(cleared), 0);
      }
      return;
    }

    setFormData((prev) => ({ ...prev, location: value }));

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const fetchId = ++fetchIdRef.current;
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${value}&apiKey=${API_KEY}`
      );
      if (fetchId !== fetchIdRef.current) return; // outdated response
      setSuggestions(res.data.features || []);
    } catch (error) {
      console.error("Geocoding error:", error);
      setSuggestions([]);
    }
  };

  const selectSuggestion = (place) => {
    const coordinates = place.geometry.coordinates;
    const newFormData = {
      ...formData,
      location: place.properties.formatted,
      lat: coordinates[1], // latitude
      lon: coordinates[0], // longitude
    };

    setFormData(newFormData);
    setSuggestions([]); // Close suggestions immediately

    // Call onBlur with updated data
    if (onBlur) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        onBlur(newFormData);
      }, 0);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (suggestions.length > 0) {
        setSuggestions([]);
      }
      if (onBlur) {
        onBlur(formData);
      }
    }, 150);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={formData.location}
        onChange={handleInput}
        onBlur={handleBlur}
        placeholder="Enter location (e.g., Sunset Beach, Ho Chi Minh City)"
        className="border border-gray-500 rounded-2xl p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {suggestions.length > 0 && (
        <ul className="absolute z-[1000] bg-white border border-gray-300 w-full rounded-md shadow-lg max-h-60 overflow-auto mt-1">
          {suggestions.map((item, idx) => (
            <li
              key={idx}
              onClick={() => selectSuggestion(item)}
              className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">📍</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {item.properties.name || item.properties.formatted}
                  </div>
                  {item.properties.formatted && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.properties.formatted}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LocationAutocomplete;
