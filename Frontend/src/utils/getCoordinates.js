export async function getCoordinates(address) {
    const apiKey = "7bd9ee841c2b406e89120e889a173c08";

    const response = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
            address
        )}&apiKey=${apiKey}`
    );

    const data = await response.json();

    if (!data.features || data.features.length === 0) return null;

    const { lat, lon } = data.features[0].properties;

    return { lat, lon };
}
